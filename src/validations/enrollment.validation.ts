import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create enrollment schema
export const createEnrollmentSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    courseId: z.number().int().positive(),
    // enrolledAt defaults to now, status defaults to 'active'
  }),
});

// Update enrollment schema (admin/instructor only)
export const updateEnrollmentSchema = z.object({
  params: idParam,
  body: z.object({
    status: z.enum(['active', 'completed', 'refunded']).optional(),
    completedAt: z.string().datetime().optional().nullable(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get enrollment by ID
export const getEnrollmentParamsSchema = z.object({
  params: idParam,
});

// List enrollments with pagination & filters
export const getEnrollmentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    userId: z.string().optional().transform(Number).optional(),
    courseId: z.string().optional().transform(Number).optional(),
    status: z.enum(['active', 'completed', 'refunded']).optional(),
    sortBy: z.enum(['enrolledAt', 'completedAt', 'createdAt', 'updatedAt']).optional().default('enrolledAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete enrollment params (admin only)
export const deleteEnrollmentParamsSchema = z.object({
  params: idParam,
});

// Complete enrollment (student self-complete)
export const completeEnrollmentSchema = z.object({
  params: idParam,
});


export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>['body'];
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>['body'];
