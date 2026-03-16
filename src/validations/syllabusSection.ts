import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create section schema
export const createSectionSchema = z.object({
  body: z.object({
    courseId: z.number().int().positive(),
    title: z.string().min(1),
    orderIndex: z.number().int().min(0).default(0),
  }),
});

// Update section schema
export const updateSectionSchema = z.object({
  params: idParam,
  body: z.object({
    title: z.string().min(1).optional(),
    orderIndex: z.number().int().min(0).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get section by ID
export const getSectionParamsSchema = z.object({
  params: idParam,
});

// List sections by course
export const getSectionsByCourseQuerySchema = z.object({
  query: z.object({
    courseId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(50), // higher default because sections are limited
    sortBy: z.enum(['orderIndex', 'title', 'createdAt']).optional().default('orderIndex'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

// Delete section params
export const deleteSectionParamsSchema = z.object({
  params: idParam,
});



export type CreateSectionInput = z.infer<typeof createSectionSchema>['body'];
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>['body'];
