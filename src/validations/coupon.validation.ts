import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create coupon schema
export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, {
      message: 'Code must contain only uppercase letters, numbers, underscores, and hyphens',
    }),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'Value must have at most two decimal places',
    }),
    courseId: z.number().int().positive().optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime(),
    isActive: z.boolean().default(true),
  }),
});

// Update coupon schema
export const updateCouponSchema = z.object({
  params: idParam,
  body: z.object({
    code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/).optional(),
    type: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())).optional(),
    courseId: z.number().int().positive().optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get coupon by ID
export const getCouponParamsSchema = z.object({
  params: idParam,
});

// Get coupon by code (for validation)
export const getCouponByCodeParamsSchema = z.object({
  params: z.object({
    code: z.string(),
  }),
});

// List coupons with filters
export const getCouponsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    code: z.string().optional(),
    courseId: z.string().optional().transform(Number).optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    sortBy: z.enum(['code', 'value', 'validFrom', 'validUntil', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Validate coupon query (public)
export const validateCouponQuerySchema = z.object({
  query: z.object({
    code: z.string(),
    courseId: z.string().optional().transform(Number).optional(),
    // amount could be added to calculate discount, but for now just validity
  }),
});

// Delete coupon params
export const deleteCouponParamsSchema = z.object({
  params: idParam,
});


// Infer the body types for create/update
export type CreateCouponInput = z.infer<typeof createCouponSchema>['body'];
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>['body'];
