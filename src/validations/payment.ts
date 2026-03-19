import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create payment schema
export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.number().int().positive(),
    amount: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'Amount must have at most two decimal places',
    }),
    paymentMethod: z.enum(['sslcommerz', 'stripe', 'paypal', 'cash', 'bank_transfer']),
    transactionId: z.string().optional(),
    gatewayResponse: z.string().optional(), // JSON string from gateway
    receiptNumber: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
    paidAt: z.string().datetime().optional(),
    installmentNumber: z.number().int().positive().optional(),
    note: z.string().optional(),
  }),
});

// Update payment schema (admin only)
export const updatePaymentSchema = z.object({
  params: idParam,
  body: z.object({
    amount: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())).optional(),
    paymentMethod: z.enum(['sslcommerz', 'stripe', 'paypal', 'cash', 'bank_transfer']).optional(),
    transactionId: z.string().optional(),
    gatewayResponse: z.string().optional(),
    receiptNumber: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    paidAt: z.string().datetime().optional(),
    installmentNumber: z.number().int().positive().optional(),
    note: z.string().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get payment by ID
export const getPaymentParamsSchema = z.object({
  params: idParam,
});

// List payments with filters
export const getPaymentsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(10),
    invoiceId: z.string().optional().transform(Number).optional(),
    userId: z.string().optional().transform(Number).optional(), // to filter by user (via invoice)
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    paymentMethod: z.enum(['sslcommerz', 'stripe', 'paypal', 'cash', 'bank_transfer']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    sortBy: z.enum(['amount', 'paidAt', 'createdAt', 'updatedAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Delete payment params (admin only)
export const deletePaymentParamsSchema = z.object({
  params: idParam,
});

// Mark payment as completed (could be used by webhook)
export const completePaymentSchema = z.object({
  params: idParam,
  body: z.object({
    transactionId: z.string().optional(),
    gatewayResponse: z.string().optional(),
    receiptNumber: z.string().optional(),
    paidAt: z.string().datetime().optional().default(() => new Date().toISOString()),
  }),
});


// Infer the body types for create/update
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>['body'];
export type CompletePaymentInput = z.infer<typeof  completePaymentSchema>['body'];
