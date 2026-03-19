import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number), // item.id is integer (serial)
});

// Base item schema
const itemBaseSchema = z.object({
  sectionId: z.number().int().positive(),
  title: z.string().min(1),
  type: z.enum(['video', 'article', 'quiz', 'coding', 'exercise', 'resource', 'assignment']),
  content: z.string().optional(), // could be URL, article text, quiz JSON, etc.
  duration: z.number().int().min(0).optional(),
  isFree: z.boolean().default(false),
  orderIndex: z.number().int().min(0).default(0),
});

// Create item schema
export const createItemSchema = z.object({
  body: itemBaseSchema,
});

// Update item schema
export const updateItemSchema = z.object({
  params: idParam,
  body: itemBaseSchema.partial().refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get item by ID
export const getItemParamsSchema = z.object({
  params: idParam,
});

// List items by section
export const getItemsBySectionQuerySchema = z.object({
  query: z.object({
    sectionId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(50),
    sortBy: z.enum(['orderIndex', 'title', 'type', 'createdAt']).optional().default('orderIndex'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

// Delete item params
export const deleteItemParamsSchema = z.object({
  params: idParam,
});

export type CreateItemInput = z.infer<typeof createItemSchema>['body'];
export type UpdateItemInput = z.infer<typeof updateItemSchema>['body'];

