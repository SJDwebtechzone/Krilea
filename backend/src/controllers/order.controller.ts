import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { query, getClient } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator.js';
import { generateInvoicePdf } from '../utils/invoiceGenerator.js';
import { sendOrderConfirmationEmail } from '../utils/mailer.js';

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `KRL-${dateStr}-${randomSuffix}`;
}

function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
}

export async function createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const userId = req.user!.id;
    const data = createOrderSchema.parse(req.body);

    await client.query('BEGIN');

    // Fetch User Info
    const userRes = await client.query(`SELECT email, first_name, last_name, phone FROM users WHERE id = $1`, [userId]);
    const user = userRes.rows[0];

    // Determine items to order
    let orderItemsData: Array<{ productId: string; quantity: number }> = [];

    if (data.items && data.items.length > 0) {
      orderItemsData = data.items;
    } else {
      // Get from cart
      const cartRes = await client.query(
        `SELECT ci.product_id as "productId", ci.quantity 
         FROM cart_items ci
         JOIN carts c ON ci.cart_id = c.id
         WHERE c.user_id = $1`,
        [userId]
      );
      if (cartRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendError(res, 'Your cart is empty.', 400);
      }
      orderItemsData = cartRes.rows;
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    const verifiedItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      price: number;
      quantity: number;
      lineTotal: number;
    }> = [];

    for (const item of orderItemsData) {
      const prodRes = await client.query(
        `SELECT id, name, sku, price, sale_price, quantity, is_active 
         FROM products 
         WHERE id = $1 FOR UPDATE`,
        [item.productId]
      );

      if (prodRes.rows.length === 0 || !prodRes.rows[0].is_active) {
        await client.query('ROLLBACK');
        return sendError(res, `Product ${item.productId} is no longer available.`, 400);
      }

      const product = prodRes.rows[0];
      if (product.quantity < item.quantity) {
        await client.query('ROLLBACK');
        return sendError(
          res,
          `Insufficient stock for "${product.name}". Only ${product.quantity} available.`,
          400
        );
      }

      const unitPrice = parseFloat(product.sale_price || product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const shippingAmount = subtotal > 1999 ? 0 : (data.shippingAmount || 0);
    const discountAmount = data.discountAmount || 0;
    const taxAmount = Math.round(subtotal * 0.03 * 100) / 100; // 3% GST on fine jewellery
    const totalAmount = Math.max(0, subtotal + shippingAmount + taxAmount - discountAmount);

    const orderNumber = generateOrderNumber();

    // Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (
        user_id, order_number, order_status, payment_status,
        subtotal, tax_amount, shipping_amount, discount_amount, total_amount,
        currency, shipping_address, billing_address, customer_notes
      ) VALUES ($1, $2, 'placed', $3, $4, $5, $6, $7, $8, 'INR', $9, $10, $11)
      RETURNING *`,
      [
        userId,
        orderNumber,
        data.paymentMethod === 'cod' ? 'pending' : 'pending',
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        JSON.stringify(data.shippingAddress),
        JSON.stringify(data.billingAddress || data.shippingAddress),
        data.customerNotes || null,
      ]
    );

    const order = orderRes.rows[0];

    // Insert Order Items and Deduct Inventory
    for (const item of verifiedItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, sku, unit_price, quantity, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.productId, item.productName, item.sku, item.price, item.quantity, item.lineTotal]
      );

      // Decrement product stock
      const updatedProd = await client.query(
        `UPDATE products SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2 RETURNING quantity`,
        [item.quantity, item.productId]
      );

      // Inventory transaction
      await client.query(
        `INSERT INTO inventory_transactions (product_id, quantity_change, quantity_after, reason, order_id, created_by)
         VALUES ($1, $2, $3, 'Order Placed', $4, $5)`,
        [item.productId, -item.quantity, updatedProd.rows[0].quantity, order.id, userId]
      );
    }

    // Create Payment Record
    const paymentRes = await client.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, amount, currency)
       VALUES ($1, $2, $3, $4, 'INR')
       RETURNING *`,
      [order.id, data.paymentMethod || 'card', data.paymentMethod === 'cod' ? 'pending' : 'pending', totalAmount]
    );

    // If order was from cart, clear user's cart
    const cartRes = await client.query(`SELECT id FROM carts WHERE user_id = $1`, [userId]);
    if (cartRes.rows.length > 0) {
      await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartRes.rows[0].id]);
    }

    // Generate Invoice PDF
    const invoiceNumber = generateInvoiceNumber();
    const invoicePdfPath = await generateInvoicePdf({
      invoiceNumber,
      orderNumber,
      orderDate: new Date(),
      customer: {
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        email: user.email,
        phone: user.phone || data.shippingAddress.phone,
        address: data.shippingAddress,
      },
      items: verifiedItems.map((it) => ({
        name: it.productName,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: it.price,
        totalPrice: it.lineTotal,
      })),
      subtotal,
      tax: taxAmount,
      shipping: shippingAmount,
      discount: discountAmount,
      total: totalAmount,
    });

    // Save Invoice Record
    await client.query(
      `INSERT INTO invoices (order_id, invoice_number, invoice_pdf_url, total_amount, tax_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [order.id, invoiceNumber, invoicePdfPath, totalAmount, taxAmount]
    );

    await client.query('COMMIT');

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail(user.email, {
      orderNumber,
      customerName: user.first_name,
      totalAmount,
      items: verifiedItems.map((i) => ({ name: i.productName, quantity: i.quantity, price: i.price })),
      shippingAddress: data.shippingAddress,
    }).catch(console.error);

    return sendSuccess(
      res,
      {
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount,
        payment: paymentRes.rows[0],
        invoiceNumber,
      },
      'Order placed successfully.',
      201
    );
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const countRes = await query(`SELECT COUNT(*) FROM orders WHERE user_id = $1`, [userId]);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const ordersRes = await query(
      `SELECT 
        o.*,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'sku', oi.sku,
            'unitPrice', oi.unit_price,
            'quantity', oi.quantity,
            'totalPrice', oi.total_price,
            'primaryImage', (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1)
          ))
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) as items,
        (SELECT invoice_number FROM invoices WHERE order_id = o.id LIMIT 1) as invoice_number,
        (SELECT payment_method FROM payments WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as payment_method
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limitNum, offset]
    );

    return sendSuccess(res, {
      orders: ordersRes.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let queryStr = `
      SELECT 
        o.*,
        u.email as customer_email, u.first_name as customer_first_name, u.last_name as customer_last_name, u.phone as customer_phone,
        (
          SELECT json_agg(json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'sku', oi.sku,
            'unitPrice', oi.unit_price,
            'quantity', oi.quantity,
            'totalPrice', oi.total_price,
            'primaryImage', (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1)
          ))
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) as items,
        (
          SELECT json_agg(json_build_object(
            'id', p.id,
            'paymentMethod', p.payment_method,
            'paymentStatus', p.payment_status,
            'transactionId', p.transaction_id,
            'amount', p.amount,
            'createdAt', p.created_at
          ))
          FROM payments p
          WHERE p.order_id = o.id
        ) as payments,
        (
          SELECT json_build_object(
            'id', inv.id,
            'invoiceNumber', inv.invoice_number,
            'pdfUrl', inv.invoice_pdf_url,
            'createdAt', inv.created_at
          )
          FROM invoices inv
          WHERE inv.order_id = o.id
          LIMIT 1
        ) as invoice
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE (o.id::text = $1 OR o.order_number = $1)
    `;

    const values = [id];
    if (!isAdmin) {
      queryStr += ` AND o.user_id = $2`;
      values.push(userId);
    }

    const orderRes = await query(queryStr, values);
    if (orderRes.rows.length === 0) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, orderRes.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function downloadInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { orderId } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let queryStr = `
      SELECT inv.invoice_pdf_url, inv.invoice_number, o.user_id
      FROM invoices inv
      JOIN orders o ON inv.order_id = o.id
      WHERE inv.order_id::text = $1 OR o.order_number = $1
    `;
    const invRes = await query(queryStr, [orderId]);
    if (invRes.rows.length === 0) {
      return sendError(res, 'Invoice not found', 404);
    }

    const invoice = invRes.rows[0];
    if (!isAdmin && invoice.user_id !== userId) {
      return sendError(res, 'Unauthorized to view this invoice', 403);
    }

    if (!fs.existsSync(invoice.invoice_pdf_url)) {
      return sendError(res, 'Invoice file is missing on server', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`);
    const fileStream = fs.createReadStream(invoice.invoice_pdf_url);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    await client.query('BEGIN');

    let orderRes;
    if (isAdmin) {
      orderRes = await client.query(`SELECT * FROM orders WHERE id = $1 FOR UPDATE`, [id]);
    } else {
      orderRes = await client.query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`, [id, userId]);
    }

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Order not found', 404);
    }

    const order = orderRes.rows[0];
    if (['shipped', 'delivered', 'cancelled'].includes(order.order_status)) {
      await client.query('ROLLBACK');
      return sendError(res, `Cannot cancel an order that is already ${order.order_status}.`, 400);
    }

    // Restore stock
    const itemsRes = await client.query(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [order.id]);
    for (const item of itemsRes.rows) {
      const updatedProd = await client.query(
        `UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING quantity`,
        [item.quantity, item.product_id]
      );
      await client.query(
        `INSERT INTO inventory_transactions (product_id, quantity_change, quantity_after, reason, order_id, created_by)
         VALUES ($1, $2, $3, 'Order Cancelled - Stock Restored', $4, $5)`,
        [item.product_id, item.quantity, updatedProd.rows[0].quantity, order.id, userId]
      );
    }

    // Update status
    await client.query(
      `UPDATE orders SET order_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [order.id]
    );

    await client.query('COMMIT');
    return sendSuccess(res, null, 'Order has been successfully cancelled and stock restored.');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function getAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, paymentStatus, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`o.order_status = $${idx++}`);
      values.push(status);
    }
    if (paymentStatus) {
      conditions.push(`o.payment_status = $${idx++}`);
      values.push(paymentStatus);
    }
    if (search) {
      conditions.push(`(o.order_number ILIKE $${idx} OR u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const ordersRes = await query(
      `SELECT 
        o.*,
        u.email as customer_email,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT invoice_number FROM invoices WHERE order_id = o.id LIMIT 1) as invoice_number
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    return sendSuccess(res, {
      orders: ordersRes.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateOrderStatusSchema.parse(req.body);

    const updates: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (data.orderStatus) {
      updates.push(`order_status = $${idx++}`);
      values.push(data.orderStatus);
    }
    if (data.paymentStatus) {
      updates.push(`payment_status = $${idx++}`);
      values.push(data.paymentStatus);
    }
    if (data.trackingNumber !== undefined) {
      updates.push(`tracking_number = $${idx++}`);
      values.push(data.trackingNumber);
    }
    if (data.courierName !== undefined) {
      updates.push(`courier_name = $${idx++}`);
      values.push(data.courierName);
    }
    if (data.adminNotes !== undefined) {
      updates.push(`admin_notes = $${idx++}`);
      values.push(data.adminNotes);
    }

    values.push(id);
    const result = await query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, result.rows[0], 'Order status updated successfully');
  } catch (err) {
    next(err);
  }
}
