import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(150).optional(),
  reviewText: z.string().min(3, 'Review must be at least 3 characters'),
  imageUrls: z.array(z.string()).optional(),
});

export const reviewSchema = createReviewSchema;

export const reviewModerationSchema = z.object({
  isApproved: z.boolean(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});
