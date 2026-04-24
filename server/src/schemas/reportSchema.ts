import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    description: z.string().optional(),
  }).passthrough()
});
