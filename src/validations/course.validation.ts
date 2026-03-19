import { z } from 'zod';

// Reusable UUID validator
const idParam = z.object({
  id: z.string().transform(Number), // course.id is integer (serial)
});

// Base schema for course fields
const courseBaseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  fullDescription: z.string().optional(),
  image: z.string().url(),
  previewVideoUrl: z.string().url().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all-levels']).default('all-levels'),
  // category: z.string().min(1),      // category name, could be validated against existing categories
  categoryId: z.number(),
  tags: z.array(z.string()).optional().default([]),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  certification: z.string().optional(),
  requirements: z.array(z.string()).optional().default([]),
  learningOutcomes: z.array(z.string()).optional().default([]),
  targetAudience: z.array(z.string()).optional().default([]),
  language: z.string().optional(),
  courseProjects: z.array(z.string()).optional().default([]),
  courseSoftware: z.array(z.string()).optional().default([]),
  courseFeatures: z.array(z.string()).optional().default([]),
  instructorId: z.number().int().positive(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  // rating, totalReviews, duration, featured, isNew, isBestseller are not set on creation,
  // they are updated by system or via separate endpoints.
});

// Create course schema
export const createCourseSchema = z.object({
  body: courseBaseSchema,
});

// Update course schema – all fields optional, but at least one must be provided
export const updateCourseSchema = z.object({
  params: idParam,
  body: courseBaseSchema.partial().refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get course by ID
export const getCourseParamsSchema = z.object({
  params: idParam,
});

// Get course by slug (alternative)
export const getCourseBySlugParamsSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
});

// List courses with pagination, filtering, sorting
export const getCoursesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    search: z.string().optional(),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'all-levels']).optional(),
    // instructorId: z.string().optional().transform(Number).optional(),
    // instructorId: z.number().int().positive(),                // <-- now expects a number
    instructorId: z.coerce.number().int().positive().optional(),

    featured: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    isNew: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    isBestseller: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    sortBy: z.enum(['title', 'price', 'rating', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete course params
export const deleteCourseParamsSchema = z.object({
  params: idParam,
});

// Publish course (admin/instructor)
export const publishCourseSchema = z.object({
  params: idParam,
});

// Update course stats (e.g., after enrollment/review) – admin only
export const updateCourseStatsSchema = z.object({
  params: idParam,
  body: z.object({
    rating: z.number().min(0).max(5).optional(),
    totalReviews: z.number().int().min(0).optional(),
    duration: z.number().int().min(0).optional(),
  }),
});


export type CreateCourseInput = z.infer<typeof createCourseSchema>['body'];
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>['body'];
