import { z } from 'zod';

export const createItemSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    type: z.enum(['lost', 'found']),
    category: z.string().min(1, 'Category is required'),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().optional().default(200),
    expiresAt: z.coerce.date().optional(),
  }).passthrough()
});
