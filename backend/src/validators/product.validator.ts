import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required').optional(),
  sku: z.string().min(2, 'SKU is required'),
  productCode: z.string().optional(),
  description: z.string().min(5, 'Description is required'),
  shortDescription: z.string().optional(),
  categoryId: z.string().uuid('Valid category ID required').nullable().optional(),
  collectionId: z.string().uuid('Valid collection ID required').nullable().optional(),
  material: z.string().default('925 Sterling Silver'),
  color: z.string().optional(),
  size: z.string().optional(),
  weightGrams: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  salePrice: z.coerce.number().min(0).nullable().optional(),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  
  // Dimensions
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  unit: z.string().default('mm'),
  sizeDescription: z.string().optional(),
  
  // Images
  imageUrls: z.array(z.string()).optional(),
});
