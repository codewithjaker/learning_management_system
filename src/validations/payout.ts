import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create payout schema
export const createPayoutSchema = z.object({
  body: z.object({
    instructorId: z.number().int().positive(),
    amount: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'Amount must have at most two decimal places',
    }),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'paid', 'failed']).default('pending'),
    paidAt: z.string().datetime().optional(),
  }).refine(data => new Date(data.periodStart) < new Date(data.periodEnd), {
    message: 'periodStart must be before periodEnd',
    path: ['periodStart', 'periodEnd'],
  }),
});

// Update payout schema (admin only)
export const updatePayoutSchema = z.object({
  params: idParam,
  body: z.object({
    amount: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())).optional(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'paid', 'failed']).optional(),
    paidAt: z.string().datetime().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get payout by ID
export const getPayoutParamsSchema = z.object({
  params: idParam,
});

// List payouts with filters
export const getPayoutsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    instructorId: z.string().optional().transform(Number).optional(),
    status: z.enum(['pending', 'paid', 'failed']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    sortBy: z.enum(['amount', 'periodStart', 'periodEnd', 'createdAt', 'paidAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete payout params (admin only)
export const deletePayoutParamsSchema = z.object({
  params: idParam,
});

// Infer the body types for create/update
export type CreatePayoutInput = z.infer<typeof createPayoutSchema>['body'];
export type UpdatePayoutInput = z.infer<typeof updatePayoutSchema>['body'];
