import { z } from 'zod';

const idParam = z.object({
  id: z.string().transform(Number),
});

// Create invoice item schema
export const createInvoiceItemSchema = z.object({
  body: z.object({
    invoiceId: z.number().int().positive(),
    courseName: z.string().min(1),
    quantity: z.number().int().positive().default(1),
    unitPrice: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())),
    total: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())),
  }),
});

// Update invoice item schema (admin only)
export const updateInvoiceItemSchema = z.object({
  params: idParam,
  body: z.object({
    courseName: z.string().min(1).optional(),
    quantity: z.number().int().positive().optional(),
    unitPrice: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/).optional(),
    total: z.number().positive().refine(val => /^\d+(\.\d{1,2})?$/).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

// Get invoice item by ID
export const getInvoiceItemParamsSchema = z.object({
  params: idParam,
});

// List invoice items by invoice
export const getInvoiceItemsQuerySchema = z.object({
  query: z.object({
    invoiceId: z.string().transform(Number),
    page: z.string().optional().transform(Number).default(1),
    limit: z.string().optional().transform(Number).default(50),
    sortBy: z.enum(['courseName', 'unitPrice', 'total', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

// Delete invoice item params (admin only)
export const deleteInvoiceItemParamsSchema = z.object({
  params: idParam,
});

export type CreateInvoiceItemInput = z.infer<typeof createInvoiceItemSchema>['body'];
export type  UpdateInvoiceItemInput = z.infer<typeof updateInvoiceItemSchema>['body'];


