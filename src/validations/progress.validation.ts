import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create/update progress schema (upsert style)
export const upsertProgressSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    itemId: z.number().int().positive(),
    completed: z.boolean().optional().default(false),
    lastPosition: z.number().int().min(0).optional(),
    // completedAt is set automatically when completed becomes true
  }),
});

// Update specific progress record (by id)
export const updateProgressSchema = z.object({
  params: idParam,
  body: z.object({
    completed: z.boolean().optional(),
    lastPosition: z.number().int().min(0).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get progress by ID
export const getProgressParamsSchema = z.object({
  params: idParam,
});

// List progress for a user in a course
export const getProgressByUserAndCourseQuerySchema = z.object({
  query: z.object({
    userId: z.string().transform(Number),
    courseId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(50),
    sortBy: z.enum(['itemId', 'completed', 'updatedAt']).optional().default('itemId'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

// List progress for a specific item (e.g., to see who completed it)
export const getProgressByItemQuerySchema = z.object({
  query: z.object({
    itemId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
  }),
});

// Delete progress params (admin only)
export const deleteProgressParamsSchema = z.object({
  params: idParam,
});


// Infer the body types for create/update
export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>['body'];
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>['body'];
