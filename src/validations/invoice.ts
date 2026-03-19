import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create invoice schema
export const createInvoiceSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().min(1),
    userId: z.number().int().positive(),
    enrollmentId: z.number().int().positive().optional().nullable(),
    couponId: z.number().int().positive().optional().nullable(),
    subtotal: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'Subtotal must have at most two decimal places',
    }),
    discount: z.number().min(0).refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())).default(0),
    total: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())),
    status: z.enum(['pending', 'paid', 'refunded', 'cancelled']).default('pending'),
    issuedAt: z.string().datetime().optional().default(() => new Date().toISOString()),
    paidAt: z.string().datetime().optional().nullable(),
  }),
});

// Update invoice schema (admin only)
export const updateInvoiceSchema = z.object({
  params: idParam,
  body: z.object({
    status: z.enum(['pending', 'paid', 'refunded', 'cancelled']).optional(),
    paidAt: z.string().datetime().optional().nullable(),
    // Note: amounts are usually not updated after creation, but we allow if needed
    subtotal: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/).optional(),
    discount: z.number().min(0).refine(val => /^\d+(\.\d{1,2})?$/).optional(),
    total: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get invoice by ID
export const getInvoiceParamsSchema = z.object({
  params: idParam,
});

// List invoices with filters
export const getInvoicesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    userId: z.string().optional().transform(Number).optional(),
    enrollmentId: z.string().optional().transform(Number).optional(),
    status: z.enum(['pending', 'paid', 'refunded', 'cancelled']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    sortBy: z.enum(['invoiceNumber', 'issuedAt', 'paidAt', 'total', 'createdAt']).optional().default('issuedAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete invoice params (admin only)
export const deleteInvoiceParamsSchema = z.object({
  params: idParam,
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>['body'];

