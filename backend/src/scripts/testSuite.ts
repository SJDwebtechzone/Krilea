import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationOTP, sendPasswordResetOTP, getMailer } from '../utils/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'krilea',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root3',
});

async function runAutomatedTests() {
  console.log('\n======================================================');
  console.log(' ✨ STARTING KRILEA FULL-STACK AUTOMATED TEST SUITE ✨');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    process.stdout.write(`Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err: any) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  const client = await pool.connect();

  try {
    // TEST 1: Database Connection & Tables
    await test('PostgreSQL Database Connection & Table Integrity', async () => {
      const res = await client.query(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
      `);
      if (res.rows.length < 20) {
        throw new Error(`Expected at least 20 tables, found ${res.rows.length}`);
      }
    });

    // TEST 2: SMTP Verification
    await test('SMTP Email Connection Verification', async () => {
      const mailer = getMailer();
      await mailer.verify();
    });

    // TEST 3: User Registration with OTP
    const testEmail = `autotest_${Date.now()}@krilea-test.in`;
    const testUsername = `autouser_${Date.now()}`;
    const testPassword = 'TestPassword123!';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHashed = crypto.createHash('sha256').update(otp).digest('hex');
    const passwordHash = await bcrypt.hash(testPassword, 10);
    let testUserId = '';

    await test('Customer Registration with Verification OTP in DB', async () => {
      const res = await client.query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name, role, email_verified, verification_otp_hash, verification_otp_expires_at)
         VALUES ($1, $2, $3, 'Auto', 'Tester', 'customer', false, $4, NOW() + INTERVAL '10 minutes')
         RETURNING id, email, role, email_verified`,
        [testEmail, testUsername, passwordHash, otpHashed]
      );
      testUserId = res.rows[0].id;
      if (!testUserId || res.rows[0].email_verified !== false) {
        throw new Error('Failed to create unverified user');
      }
    });

    // TEST 4: OTP Verification & Email Activation
    await test('OTP Verification & Email Activation', async () => {
      const user = await client.query(`SELECT verification_otp_hash FROM users WHERE id = $1`, [testUserId]);
      if (user.rows[0].verification_otp_hash !== otpHashed) {
        throw new Error('OTP hash mismatch');
      }

      await client.query(
        `UPDATE users SET email_verified = true, email_verified_at = NOW(), verification_otp_hash = NULL WHERE id = $1`,
        [testUserId]
      );

      const verifiedUser = await client.query(`SELECT email_verified FROM users WHERE id = $1`, [testUserId]);
      if (verifiedUser.rows[0].email_verified !== true) {
        throw new Error('User was not marked as verified');
      }
    });

    // TEST 5: Password Hash Comparison
    await test('Secure Password Authentication Check', async () => {
      const user = await client.query(`SELECT password_hash FROM users WHERE id = $1`, [testUserId]);
      const isMatch = await bcrypt.compare(testPassword, user.rows[0].password_hash);
      if (!isMatch) throw new Error('Password verification failed');
      const isWrongMatch = await bcrypt.compare('WrongPassword', user.rows[0].password_hash);
      if (isWrongMatch) throw new Error('Password check false positive');
    });

    // TEST 6: Address Management CRUD
    let testAddressId = '';
    await test('Customer Address CRUD Operations', async () => {
      // Create
      const addRes = await client.query(
        `INSERT INTO addresses (user_id, full_name, phone, address_line1, city, state, pincode, country, is_default)
         VALUES ($1, 'Auto Tester', '+91 9876543210', '123 Test St', 'Chennai', 'Tamil Nadu', '600001', 'India', true)
         RETURNING id`,
        [testUserId]
      );
      testAddressId = addRes.rows[0].id;
      if (!testAddressId) throw new Error('Failed creating address');

      // Update
      await client.query(`UPDATE addresses SET address_line1 = '456 Updated St' WHERE id = $1`, [testAddressId]);
      const updated = await client.query(`SELECT address_line1 FROM addresses WHERE id = $1`, [testAddressId]);
      if (updated.rows[0].address_line1 !== '456 Updated St') throw new Error('Failed updating address');
    });

    // TEST 7: Product Management CRUD
    let testProductId = '';
    const testSku = `TEST-${Date.now()}`;
    await test('Product Management CRUD & Image Associations', async () => {
      const prodRes = await client.query(
        `INSERT INTO products (name, slug, sku, description, price, quantity, material, is_active)
         VALUES ('Automated Test Emerald Ring', $1, $2, 'Handcrafted emerald solitaire', 2499.00, 15, '925 Sterling Silver', true)
         RETURNING id, name, price`,
        [`test-emerald-ring-${Date.now()}`, testSku]
      );
      testProductId = prodRes.rows[0].id;
      if (!testProductId) throw new Error('Failed creating test product');

      // Add Product Image
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, '/uploads/test-ring.jpg', true)`,
        [testProductId]
      );

      const imgRes = await client.query(`SELECT image_url FROM product_images WHERE product_id = $1`, [testProductId]);
      if (imgRes.rows.length === 0) throw new Error('Failed associating product image');
    });

    // TEST 8: Cart Database Operations
    await test('Cart Management & Item Persistence', async () => {
      // Ensure cart exists
      const cartRes = await client.query(
        `INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW() RETURNING id`,
        [testUserId]
      );
      const cartId = cartRes.rows[0].id;

      // Add Item
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, 2)`,
        [cartId, testProductId]
      );

      const items = await client.query(`SELECT quantity FROM cart_items WHERE cart_id = $1`, [cartId]);
      if (items.rows[0].quantity !== 2) throw new Error('Cart item quantity mismatch');
    });

    // TEST 9: Wishlist Database Operations
    await test('Wishlist Management & Item Persistence', async () => {
      await client.query(
        `INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)`,
        [testUserId, testProductId]
      );
      const wishRes = await client.query(
        `SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
        [testUserId, testProductId]
      );
      if (wishRes.rows.length === 0) throw new Error('Wishlist item not persisted');
    });

    // TEST 10: Admin Dashboard KPI Analytics Query
    await test('Admin Dashboard Analytics SQL Aggregation', async () => {
      const kpiRes = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM products) as total_products,
          (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') as revenue
      `);
      if (parseInt(kpiRes.rows[0].total_products, 10) < 1) {
        throw new Error('KPI aggregation returned invalid product count');
      }
    });

    // Clean up test records
    await client.query(`DELETE FROM users WHERE id = $1`, [testUserId]);
    await client.query(`DELETE FROM products WHERE id = $1`, [testProductId]);

  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n======================================================');
  console.log(` 📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAutomatedTests();
