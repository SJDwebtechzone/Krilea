import bcrypt from 'bcryptjs';
import pg from 'pg';
import { env } from '../config/env.js';

const { Client } = pg;

export async function runSeed() {
  const client = new Client({
    connectionString: env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL for seeding...');

    // 1. Password Hashes
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);

    // 2. Users
    await client.query(`
      INSERT INTO users (id, email, username, password_hash, first_name, last_name, phone, role)
      VALUES 
        ('a0000000-0000-0000-0000-000000000001', 'admin@krilea.in', 'admin', '${adminPasswordHash}', 'Krilea', 'Admin', '+91 93647 33735', 'admin'),
        ('a0000000-0000-0000-0000-000000000002', 'customer@krilea.in', 'customer', '${customerPasswordHash}', 'Priya', 'Sharma', '+91 98765 43210', 'customer')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role;
    `);
    console.log('✓ Users seeded (admin@krilea.in, customer@krilea.in)');

    // 3. User Carts
    await client.query(`
      INSERT INTO carts (user_id) VALUES 
        ('a0000000-0000-0000-0000-000000000001'),
        ('a0000000-0000-0000-0000-000000000002')
      ON CONFLICT (user_id) DO NOTHING;
    `);

    // 4. Collections
    await client.query(`
      INSERT INTO collections (id, name, slug, description, banner_url, is_active)
      VALUES 
        ('c0000000-0000-0000-0000-000000000001', 'Silver Collection', 'silver-collection', 'Pure 925 certified sterling silver jewellery designed for quiet luxury and everyday elegance.', '/silvercollection/hero/silver-hero.png', true),
        ('c0000000-0000-0000-0000-000000000002', 'Fashion Collection', 'fashion-collection', 'Trendsetting statement jewellery celebrating individuality and modern glam.', '/fashioncollection/hero/fassion-hero.png', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, banner_url = EXCLUDED.banner_url;
    `);
    console.log('✓ Collections seeded');

    // 5. Categories
    await client.query(`
      INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
      VALUES 
        ('e0000000-0000-0000-0000-000000000001', 'Rings', 'rings', 'Statement and stackable rings crafted in 925 sterling silver.', '/home/categories/category-rings.png', 1, true),
        ('e0000000-0000-0000-0000-000000000002', 'Chain / Pendant', 'chain-pendant', 'Delicate chains and symbolic pendants.', '/home/categories/category-chain.png', 2, true),
        ('e0000000-0000-0000-0000-000000000003', 'Earrings', 'earrings', 'Studs, hoops, and danglers with fine stones.', '/home/categories/category-earrings.png', 3, true),
        ('e0000000-0000-0000-0000-000000000004', 'Anklets', 'anklets', 'Graceful anklets made to complement every step.', '/home/categories/category-anklets.png', 4, true),
        ('e0000000-0000-0000-0000-000000000005', 'Gifts', 'gifts', 'Thoughtful handcrafted jewellery gifts.', '/home/categories/category-gifts.png', 5, true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
    `);
    console.log('✓ Categories seeded');

    // 6. Products
    await client.query(`
      INSERT INTO products (
        id, name, slug, sku, description, short_description, category_id, collection_id, material, color, size, weight_grams, price, sale_price, quantity, low_stock_threshold, is_featured, is_best_seller, is_active, rating, review_count
      ) VALUES 
        ('b0000000-0000-0000-0000-000000000001', 'Emerald Charm Necklace', 'emerald-charm-necklace', 'KRL-ECN-01', 'An ethereal emerald drop pendant surrounded by delicate zircon halos on pure 925 sterling silver chain.', 'Handcrafted 925 Sterling Silver emerald pendant.', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Emerald Green / Silver', '18 inches', 4.50, 2499.00, 2299.00, 25, 5, true, true, true, 4.9, 128),
        ('b0000000-0000-0000-0000-000000000002', 'Floral Diamond Earrings', 'floral-diamond-earrings', 'KRL-FDE-02', 'Intricately clustered floral motif earrings with premium cubic zirconia and anti-tarnish rhodium finish.', 'Certified 925 Silver floral studs.', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Silver / Clear Crystal', '12mm x 12mm', 3.20, 1299.00, 1199.00, 30, 5, true, true, true, 4.8, 96),
        ('b0000000-0000-0000-0000-000000000003', 'Classic Bangle Bracelet', 'classic-bangle-bracelet', 'KRL-CBB-03', 'A sleek, minimalist solid 925 silver cuff designed for comfortable all-day luxury wear.', 'Solid 925 silver minimalist cuff.', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Silver', '2.4 / 2.6 Size', 8.50, 1599.00, 1449.00, 18, 4, true, true, true, 4.9, 84),
        ('b0000000-0000-0000-0000-000000000004', 'Minimal Gold Ring', 'minimal-gold-ring', 'KRL-MGR-04', '18K gold vermeil over 925 sterling silver band with subtle shimmer.', '18K Gold Vermeil over 925 Silver.', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '18K Gold Vermeil / 925 Silver', 'Champagne Gold', 'Size 14', 2.80, 999.00, 899.00, 40, 5, false, true, true, 4.7, 112),
        ('b0000000-0000-0000-0000-000000000005', 'Layered Chain Necklace', 'layered-chain-necklace', 'KRL-LCN-05', 'Dual-tier 925 sterling silver chain with subtle texture contrasts.', 'Dual-tier silver layering necklace.', 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Silver', '16-18 inches', 5.60, 1899.00, 1699.00, 15, 3, true, true, true, 4.9, 74),
        ('b0000000-0000-0000-0000-000000000006', 'Emerald Stud Earrings', 'emerald-stud-earrings', 'KRL-ESE-06', 'Solitaire lab-grown Colombian emerald studs set in 925 silver bezel.', 'Colombian emerald studs in 925 silver.', 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Emerald Green', '6mm Round', 2.10, 1099.00, 999.00, 22, 5, false, false, true, 4.8, 63),
        ('b0000000-0000-0000-0000-000000000007', 'Twist Ring', 'twist-ring', 'KRL-TWR-07', 'Twisted rope band ring in oxidized 925 sterling silver.', 'Oxidized rope twist band in 925 silver.', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Oxidized Silver', 'Adjustable (Free Size)', 3.40, 899.00, 799.00, 35, 5, false, false, true, 4.6, 52),
        ('b0000000-0000-0000-0000-000000000008', 'Pearl Charm Bracelet', 'pearl-charm-bracelet', 'KRL-PCB-08', 'Natural freshwater pearl suspended on 925 silver link chain.', 'Freshwater pearl drop charm bracelet.', 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '925 Sterling Silver', 'Pearl White / Silver', '7 inches + 1 inch extension', 4.10, 1499.00, 1349.00, 20, 4, true, true, true, 4.8, 91)
      ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, sale_price = EXCLUDED.sale_price, quantity = EXCLUDED.quantity;
    `);
    console.log('✓ Products seeded');

    // 7. Product Images
    await client.query(`
      INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
      VALUES 
        ('b0000000-0000-0000-0000-000000000001', '/home/products/emerald-charm-necklace.jpg', 'Emerald Charm Necklace Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000002', '/home/products/floral-diamond-earrings.jpg', 'Floral Diamond Earrings Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000003', '/home/products/classic-bangle-bracelet.jpg', 'Classic Bangle Bracelet Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000004', '/home/products/minimal-gold-ring.jpg', 'Minimal Gold Ring Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000005', '/home/products/layered-chain-necklace.jpg', 'Layered Chain Necklace Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000006', '/home/products/emerald-stud-earrings.jpg', 'Emerald Stud Earrings Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000007', '/home/products/twist-ring.jpg', 'Twist Ring Front View', true, 1),
        ('b0000000-0000-0000-0000-000000000008', '/home/products/pearl-charm-bracelet.jpg', 'Pearl Charm Bracelet Front View', true, 1)
      ON CONFLICT DO NOTHING;
    `);

    // 8. Product Dimensions
    await client.query(`
      INSERT INTO product_dimensions (product_id, length, width, height, unit, size_description)
      VALUES 
        ('b0000000-0000-0000-0000-000000000001', 450.00, 12.00, 4.00, 'mm', '45cm adjustable silver chain with 1.2cm emerald pendant drop'),
        ('b0000000-0000-0000-0000-000000000002', 12.00, 12.00, 5.00, 'mm', 'Secure push-back closure with hypoallergenic post'),
        ('b0000000-0000-0000-0000-000000000003', 60.00, 50.00, 3.00, 'mm', 'Flexible slip-on cuff fitting wrist circumference 15-18cm'),
        ('b0000000-0000-0000-0000-000000000004', 18.00, 18.00, 2.00, 'mm', 'Standard Indian ring size 14 (17.3mm inner diameter)'),
        ('b0000000-0000-0000-0000-000000000005', 460.00, 2.00, 1.50, 'mm', 'Layer 1: 40cm, Layer 2: 45cm + 5cm extension'),
        ('b0000000-0000-0000-0000-000000000006', 6.00, 6.00, 4.00, 'mm', '6mm round brilliant solitaire prong setting'),
        ('b0000000-0000-0000-0000-000000000007', 17.00, 17.00, 3.00, 'mm', 'Open-ended adjustable band fitting sizes 12 through 18'),
        ('b0000000-0000-0000-0000-000000000008', 180.00, 8.00, 8.00, 'mm', '18cm link chain with 8mm AAA freshwater pearl')
      ON CONFLICT (product_id) DO NOTHING;
    `);

    // 9. Site Settings
    await client.query(`
      INSERT INTO site_settings (key, value, description)
      VALUES 
        ('site_name', 'Kriléa', 'Official Brand Name'),
        ('contact_email', 'support@krilea.in', 'Customer Care Email'),
        ('contact_phone', '+91 93647 33735', 'Helpline Number'),
        ('free_shipping_threshold', '999', 'Minimum order amount for free delivery (INR)'),
        ('gst_rate', '3', 'Applicable GST rate on fine jewellery (%)'),
        ('announcement_bar', 'Pan India shipping on all orders | 100% Certified 925 Sterling Silver', 'Top Announcement Bar Text')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `);

    // 10. Sample Customer Address
    await client.query(`
      INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, landmark, city, state, pincode, country, is_default)
      VALUES (
        'd0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002',
        'Priya Sharma',
        '+91 98765 43210',
        'Flat 4B, Royal Emerald Residency',
        'Anna Salai, T. Nagar',
        'Near City Centre Mall',
        'Chennai',
        'Tamil Nadu',
        '600017',
        'India',
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 11. Initial Sample Reviews
    await client.query(`
      INSERT INTO product_reviews (id, product_id, user_id, rating, title, review_text, is_verified_purchase, is_approved)
      VALUES 
        ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 5, 'Breathtaking Emerald Glow!', 'The shine on this piece is extraordinary. The emerald color is deep and rich, and the 925 silver hallmark is clearly visible. Came with a lovely luxury box and certificate!', true, true),
        ('f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 5, 'Perfect Daily Sparkle', 'Wore these earrings every day for 2 weeks now, absolutely no tarnishing or skin irritation. Very lightweight and elegant.', true, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ All PostgreSQL tables seeded with verified data!');
  } catch (err: any) {
    console.error('Seeding error:', err);
  } finally {
    await client.end();
  }
}

runSeed();
