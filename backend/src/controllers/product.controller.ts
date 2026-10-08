import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { productSchema } from '../validators/product.validator.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const {
      search,
      collection,
      category,
      minPrice,
      maxPrice,
      material,
      featured,
      bestseller,
      inStock,
      sort,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = req.user?.role === 'admin' ? [] : ['p.is_active = true'];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (collection) {
      conditions.push(`(LOWER(col.slug) = LOWER($${idx}) OR col.id::text = $${idx})`);
      values.push(collection);
      idx++;
    }

    if (category) {
      conditions.push(`(LOWER(cat.slug) = LOWER($${idx}) OR cat.id::text = $${idx} OR cat.name ILIKE $${idx})`);
      values.push(category);
      idx++;
    }

    if (minPrice) {
      conditions.push(`COALESCE(p.sale_price, p.price) >= $${idx}`);
      values.push(parseFloat(minPrice as string));
      idx++;
    }

    if (maxPrice) {
      conditions.push(`COALESCE(p.sale_price, p.price) <= $${idx}`);
      values.push(parseFloat(maxPrice as string));
      idx++;
    }

    if (material) {
      conditions.push(`p.material ILIKE $${idx}`);
      values.push(`%${material}%`);
      idx++;
    }

    if (featured === 'true') {
      conditions.push(`p.is_featured = true`);
    }

    if (bestseller === 'true') {
      conditions.push(`p.is_best_seller = true`);
    }

    if (inStock === 'true') {
      conditions.push(`p.quantity > 0`);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'COALESCE(p.sale_price, p.price) ASC';
    if (sort === 'price_desc') orderBy = 'COALESCE(p.sale_price, p.price) DESC';
    if (sort === 'rating') orderBy = 'p.rating DESC, p.review_count DESC';
    if (sort === 'name_asc') orderBy = 'p.name ASC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) 
      FROM products p
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN collections col ON p.collection_id = col.id
      ${whereClause}
    `;
    const countRes = await query(countQuery, values);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
      SELECT 
        p.id, p.name, p.slug, p.sku, p.product_code, p.description, p.short_description,
        p.category_id, p.collection_id, p.low_stock_threshold, p.updated_at,
        p.material, p.color, p.size, p.weight_grams, p.price, p.sale_price, p.quantity,
        p.is_featured, p.is_best_seller, p.is_active, p.rating, p.review_count, p.created_at,
        cat.name as category_name, cat.slug as category_slug,
        col.name as collection_name, col.slug as collection_slug,
        (
          SELECT json_agg(json_build_object('url', pi.image_url, 'alt', pi.alt_text, 'isPrimary', pi.is_primary) ORDER BY pi.sort_order ASC)
          FROM product_images pi
          WHERE pi.product_id = p.id
        ) as images,
        (
          SELECT json_build_object('length', pd.length, 'width', pd.width, 'height', pd.height, 'unit', pd.unit, 'sizeDescription', pd.size_description)
          FROM product_dimensions pd
          WHERE pd.product_id = p.id
        ) as dimensions
      FROM products p
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN collections col ON p.collection_id = col.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limitNum, offset);
    const dataRes = await query(dataQuery, values);

    return sendSuccess(res, {
      products: dataRes.rows,
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

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const productRes = await query(
      `SELECT 
        p.*,
        cat.name as category_name, cat.slug as category_slug,
        col.name as collection_name, col.slug as collection_slug,
        (
          SELECT json_agg(json_build_object('id', pi.id, 'url', pi.image_url, 'alt', pi.alt_text, 'isPrimary', pi.is_primary, 'sortOrder', pi.sort_order) ORDER BY pi.sort_order ASC)
          FROM product_images pi
          WHERE pi.product_id = p.id
        ) as images,
        (
          SELECT json_build_object('length', pd.length, 'width', pd.width, 'height', pd.height, 'unit', pd.unit, 'sizeDescription', pd.size_description)
          FROM product_dimensions pd
          WHERE pd.product_id = p.id
        ) as dimensions
      FROM products p
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN collections col ON p.collection_id = col.id
      WHERE (p.slug = $1 OR p.id::text = $1) AND p.is_active = true`,
      [slug]
    );

    if (productRes.rows.length === 0) {
      return sendError(res, 'Product not found.', 404, 'NOT_FOUND');
    }

    const product = productRes.rows[0];

    // Load approved reviews
    const reviewsRes = await query(
      `SELECT 
        pr.id, pr.rating, pr.title, pr.review_text, pr.is_verified_purchase, pr.created_at,
        u.first_name, u.last_name,
        (
          SELECT json_agg(ri.image_url)
          FROM review_images ri
          WHERE ri.review_id = pr.id
        ) as images
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = $1 AND pr.is_approved = true
      ORDER BY pr.created_at DESC`,
      [product.id]
    );

    return sendSuccess(res, {
      product,
      reviews: reviewsRes.rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBestSellingProducts(req: Request, res: Response, next: NextFunction) {
  try {
    // Calculate best selling from actual paid order items first, fallback to is_best_seller flag
    const bestSellersRes = await query(
      `SELECT 
        p.id, p.name, p.slug, p.sku, p.price, p.sale_price, p.quantity, p.rating, p.review_count,
        cat.name as category_name,
        col.name as collection_name,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        (
          SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN collections col ON p.collection_id = col.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
      WHERE p.is_active = true
      GROUP BY p.id, cat.name, col.name
      ORDER BY total_sold DESC, p.is_best_seller DESC, p.rating DESC
      LIMIT 8`
    );

    return sendSuccess(res, bestSellersRes.rows);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const data = productSchema.parse(req.body);
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await client.query('BEGIN');

    const productRes = await client.query(
      `INSERT INTO products (
        name, slug, sku, product_code, description, short_description,
        category_id, collection_id, material, color, size, weight_grams,
        price, sale_price, quantity, low_stock_threshold, is_featured, is_best_seller, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        data.name,
        slug,
        data.sku,
        data.productCode || null,
        data.description,
        data.shortDescription || null,
        data.categoryId || null,
        data.collectionId || null,
        data.material,
        data.color || null,
        data.size || null,
        data.weightGrams || null,
        data.price,
        data.salePrice ?? null,
        data.quantity,
        data.lowStockThreshold,
        data.isFeatured,
        data.isBestSeller,
        data.isActive,
      ]
    );

    const product = productRes.rows[0];

    // Insert dimensions if supplied
    if (data.length || data.width || data.height || data.sizeDescription) {
      await client.query(
        `INSERT INTO product_dimensions (product_id, length, width, height, unit, size_description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [product.id, data.length || null, data.width || null, data.height || null, data.unit || 'mm', data.sizeDescription || null]
      );
    }

    // Insert images if provided
    if (data.imageUrls && data.imageUrls.length > 0) {
      for (let i = 0; i < data.imageUrls.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [product.id, data.imageUrls[i], `${product.name} view ${i + 1}`, i === 0, i + 1]
        );
      }
    }

    // Initial Inventory Transaction
    if (data.quantity > 0) {
      await client.query(
        `INSERT INTO inventory_transactions (product_id, quantity_change, quantity_after, reason, created_by)
         VALUES ($1, $2, $3, 'Initial Stock Creation', $4)`,
        [product.id, data.quantity, data.quantity, req.user!.id]
      );
    }

    await client.query('COMMIT');
    return sendSuccess(res, product, 'Product created successfully.', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const client = await getClient();
  try {
    const { id } = req.params;
    const data = productSchema.parse(req.body);

    await client.query('BEGIN');

    // Get current stock to check if inventory transaction needed
    const currentRes = await client.query(`SELECT quantity FROM products WHERE id = $1`, [id]);
    if (currentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 'Product not found.', 404);
    }

    const currentQty = currentRes.rows[0].quantity;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedRes = await client.query(
      `UPDATE products SET
        name = $1, slug = $2, sku = $3, product_code = $4, description = $5,
        short_description = $6, category_id = $7, collection_id = $8, material = $9,
        color = $10, size = $11, weight_grams = $12, price = $13, sale_price = $14,
        quantity = $15, low_stock_threshold = $16, is_featured = $17, is_best_seller = $18,
        is_active = $19, updated_at = NOW()
      WHERE id = $20
      RETURNING *`,
      [
        data.name, slug, data.sku, data.productCode || null, data.description,
        data.shortDescription || null, data.categoryId || null, data.collectionId || null,
        data.material, data.color || null, data.size || null, data.weightGrams || null,
        data.price, data.salePrice ?? null, data.quantity, data.lowStockThreshold,
        data.isFeatured, data.isBestSeller, data.isActive, id
      ]
    );

    // Update Dimensions
    await client.query(
      `INSERT INTO product_dimensions (product_id, length, width, height, unit, size_description)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_id) DO UPDATE SET
        length = EXCLUDED.length, width = EXCLUDED.width, height = EXCLUDED.height,
        unit = EXCLUDED.unit, size_description = EXCLUDED.size_description`,
      [id, data.length || null, data.width || null, data.height || null, data.unit || 'mm', data.sizeDescription || null]
    );

    // Inventory adjustment transaction if quantity changed
    if (data.quantity !== currentQty) {
      const diff = data.quantity - currentQty;
      await client.query(
        `INSERT INTO inventory_transactions (product_id, quantity_change, quantity_after, reason, created_by)
         VALUES ($1, $2, $3, 'Admin Stock Adjustment', $4)`,
        [id, diff, data.quantity, req.user!.id]
      );
    }

    // Update Images if provided
    if (data.imageUrls) {
      await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
      for (let i = 0; i < data.imageUrls.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, data.imageUrls[i], data.name, i === 0, i]
        );
      }
    }

    await client.query('COMMIT');
    return sendSuccess(res, updatedRes.rows[0], 'Product updated successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM products WHERE id = $1`, [id]);
    return sendSuccess(res, null, 'Product deleted successfully.');
  } catch (err) {
    next(err);
  }
}
