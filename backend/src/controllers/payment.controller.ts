import { Response, NextFunction } from 'express';
import { query, getClient } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';

const paymentVerifySchema = z.object({
  orderId: z.string().uuid(),
  paymentMethod: z.enum(['card', 'upi', 'netbanking', 'cod', 'wallet']),
  transactionId: z.string().optional(),
  status: z.enum(['paid', 'failed', 'pending']).default('paid'),
  gatewayResponse: z.record(z.any()).optional(),
});

export async function processPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const userId = req.user!.id;
    const data = paymentVerifySchema.parse(req.body);

    await client.query('BEGIN');

    // Find order
    const orderRes = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [data.orderId, userId]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Order not found', 404);
    }

    const order = orderRes.rows[0];
    const txnId = data.transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update or Insert Payment record
    const payRes = await client.query(
      `INSERT INTO payments (
        order_id, payment_method, payment_status, transaction_id,
        amount, currency, gateway_response
      ) VALUES ($1, $2, $3, $4, $5, 'INR', $6)
      RETURNING *`,
      [
        order.id,
        data.paymentMethod,
        data.status,
        txnId,
        order.total_amount,
        data.gatewayResponse ? JSON.stringify(data.gatewayResponse) : null,
      ]
    );

    // Update order status if payment succeeded
    if (data.status === 'paid') {
      await client.query(
        `UPDATE orders SET
          payment_status = 'paid',
          order_status = CASE WHEN order_status = 'placed' THEN 'processing' ELSE order_status END,
          updated_at = NOW()
        WHERE id = $1`,
        [order.id]
      );
    }

    await client.query('COMMIT');

    return sendSuccess(
      res,
      {
        payment: payRes.rows[0],
        orderStatus: data.status === 'paid' ? 'processing' : order.order_status,
        paymentStatus: data.status,
      },
      data.status === 'paid' ? 'Payment processed successfully.' : 'Payment record updated.'
    );
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}
