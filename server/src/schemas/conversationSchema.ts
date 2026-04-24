import { z } from 'zod';

export const startConversationSchema = z.object({
  body: z.object({
    itemId: z.string({
      message: 'Valid item ID is required',
    }),
    initialMessage: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string({
      message: 'Message content is required',
    }).min(1, 'Message content cannot be empty'),
  }),
});
