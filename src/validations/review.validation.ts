import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create review schema
export const createReviewSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    courseId: z.number().int().positive(),
    rating: z.number().min(0).max(5).refine(val => /^\d+(\.\d)?$/.test(val.toString()), {
      message: 'Rating must have at most one decimal place',
    }),
    comment: z.string().optional(),
  }),
});

// Get 
export const getReviewsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    courseId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    rating: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    sortBy: z.enum(['createdAt', 'rating']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Update review schema
export const updateReviewSchema = z.object({
  params: idParam,
  body: z.object({
    rating: z.number().min(0).max(5).refine(val => /^\d+(\.\d)?$/.test(val.toString())).optional(),
    comment: z.string().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get review by ID
export const getReviewParamsSchema = z.object({
  params: idParam,
});

// List reviews for a course
export const getReviewsByCourseQuerySchema = z.object({
  query: z.object({
    courseId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    sortBy: z.enum(['rating', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// List reviews by user (admin/instructor)
export const getReviewsByUserQuerySchema = z.object({
  query: z.object({
    userId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
  }),
});

// Get user's review for a specific course
export const getUserReviewParamsSchema = z.object({
  params: z.object({
    userId: z.string().transform(Number),
    courseId: z.string().transform(Number),
  }),
});

// Delete review params
export const deleteReviewParamsSchema = z.object({
  params: idParam,
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
