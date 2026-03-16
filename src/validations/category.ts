import { z } from 'zod';

// Create category (admin only)
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

// Update category (admin only)
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get category by ID
export const getCategoryParamsSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
});

// Get category by slug (alternative)
export const getCategoryBySlugParamsSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
});

// List categories with pagination & search
export const getCategoriesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete category params
export const deleteCategoryParamsSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
});

// Infer the body types for create/update
export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];