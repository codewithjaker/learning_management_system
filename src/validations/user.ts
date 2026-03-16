import { z } from 'zod';

// Create user (admin only) – note: password required
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
    role: z.enum(['student', 'instructor', 'admin']).default('student'),
    isActive: z.boolean().default(true),
  }),
});

// Update user (admin or self)
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
  body: z.object({
    email: z.string().email().optional(),
    fullName: z.string().min(1).optional(),
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
    role: z.enum(['student', 'instructor', 'admin']).optional(),
    isActive: z.boolean().optional(),
  }),
});

// Get user by ID
export const getUserParamsSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
});

// Get all users with pagination & filters
export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    search: z.string().optional(),
    role: z.enum(['student', 'instructor', 'admin']).optional(),
    sortBy: z.enum(['fullName', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete user params
export const deleteUserParamsSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
});

// Infer the body types for create/update
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];