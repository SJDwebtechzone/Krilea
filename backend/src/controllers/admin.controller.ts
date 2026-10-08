import { Response, NextFunction } from 'express';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Total Revenue (Paid orders)
    const revRes = await query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE payment_status = 'paid'`
    );
    const totalRevenue = parseFloat(revRes.rows[0].total_revenue);

    // Total Orders count by status
    const ordersStatsRes = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN order_status = 'placed' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders
       FROM orders`
    );

    // Customers count
    const custRes = await query(`SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'`);
    const totalCustomers = parseInt(custRes.rows[0].total_customers, 10);

    // Products & Stock stats
    const prodStatsRes = await query(
      `SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN quantity <= low_stock_threshold THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count
       FROM products`
    );

    // Recent 10 Orders
    const recentOrdersRes = await query(
      `SELECT 
        o.id, o.order_number, o.total_amount, o.order_status, o.payment_status, o.created_at,
        u.email as customer_email, u.first_name as customer_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // 30-Day Sales Chart Data
    const salesChartRes = await query(
      `SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') as date,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(o.id) as orders_count
       FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day'::interval) d(day)
       LEFT JOIN orders o ON DATE(o.created_at) = DATE(d.day) AND o.payment_status = 'paid'
       GROUP BY d.day
       ORDER BY d.day ASC`
    );

    // Top 5 Best Selling Products
    const topProductsRes = await query(
      `SELECT 
        p.id, p.name, p.slug, p.price, p.sale_price,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    // Low Stock Alert Products
    const lowStockRes = await query(
      `SELECT id, name, sku, quantity, low_stock_threshold, price
       FROM products
       WHERE quantity <= low_stock_threshold
       ORDER BY quantity ASC
       LIMIT 10`
    );

    // Pending Reviews
    const pendingReviewsRes = await query(
      `SELECT COUNT(*) as pending_reviews FROM product_reviews WHERE is_approved = false`
    );

    // New Enquiries
    const newEnquiriesRes = await query(
      `SELECT COUNT(*) as new_enquiries FROM contact_enquiries WHERE status = 'new'`
    );

    return sendSuccess(res, {
      kpi: {
        totalRevenue,
        totalOrders: parseInt(ordersStatsRes.rows[0].total_orders, 10),
        pendingOrders: parseInt(ordersStatsRes.rows[0].pending_orders, 10),
        processingOrders: parseInt(ordersStatsRes.rows[0].processing_orders, 10),
        deliveredOrders: parseInt(ordersStatsRes.rows[0].delivered_orders, 10),
        cancelledOrders: parseInt(ordersStatsRes.rows[0].cancelled_orders, 10),
        totalCustomers,
        totalProducts: parseInt(prodStatsRes.rows[0].total_products, 10),
        lowStockCount: parseInt(prodStatsRes.rows[0].low_stock_count, 10),
        outOfStockCount: parseInt(prodStatsRes.rows[0].out_of_stock_count, 10),
        pendingReviewsCount: parseInt(pendingReviewsRes.rows[0].pending_reviews, 10),
        newEnquiriesCount: parseInt(newEnquiriesRes.rows[0].new_enquiries, 10),
      },
      recentOrders: recentOrdersRes.rows,
      salesChart: salesChartRes.rows,
      topProducts: topProductsRes.rows,
      lowStockAlerts: lowStockRes.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [`u.role = 'customer'`];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(u.email ILIKE $${idx} OR u.username ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await query(`SELECT COUNT(*) FROM users u ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const customersRes = await query(
      `SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as lifetime_spend
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    return sendSuccess(res, {
      customers: customersRes.rows,
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

export async function getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(inv.invoice_number ILIKE $${idx} OR o.order_number ILIKE $${idx} OR u.email ILIKE $${idx} OR u.first_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) FROM invoices inv JOIN orders o ON inv.order_id = o.id JOIN users u ON o.user_id = u.id ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const invoicesRes = await query(
      `SELECT 
        inv.*,
        o.order_number, o.created_at as order_date,
        u.email as customer_email, u.first_name as customer_first_name, u.last_name as customer_last_name
       FROM invoices inv
       JOIN orders o ON inv.order_id = o.id
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY inv.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    return sendSuccess(res, {
      invoices: invoicesRes.rows,
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

export async function getInventoryLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { productId, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (productId) {
      conditions.push(`it.product_id = $${idx++}`);
      values.push(productId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM inventory_transactions it ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const logsRes = await query(
      `SELECT 
        it.*,
        p.name as product_name, p.sku as product_sku,
        u.email as created_by_email
       FROM inventory_transactions it
       JOIN products p ON it.product_id = p.id
       LEFT JOIN users u ON it.created_by = u.id
       ${whereClause}
       ORDER BY it.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    return sendSuccess(res, {
      logs: logsRes.rows,
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

export async function getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await query(`SELECT key, value, description FROM site_settings ORDER BY key ASC`);
    const settingsMap: Record<string, string> = {};
    for (const row of result.rows) {
      settingsMap[row.key] = row.value;
    }
    return sendSuccess(res, { list: result.rows, map: settingsMap });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { settings } = req.body; // array of { key, value } or object map
    if (typeof settings === 'object' && !Array.isArray(settings)) {
      for (const [k, v] of Object.entries(settings)) {
        await query(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [k, String(v)]
        );
      }
    } else if (Array.isArray(settings)) {
      for (const item of settings) {
        await query(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [item.key, String(item.value)]
        );
      }
    }

    return sendSuccess(res, null, 'Settings updated successfully.');
  } catch (err) {
    next(err);
  }
}
