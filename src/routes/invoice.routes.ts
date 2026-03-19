import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoiceParamsSchema,
  getInvoicesQuerySchema,
  deleteInvoiceParamsSchema,
} from '../validations/invoice';

const router = Router();

// All invoice routes require authentication
router.use(authenticate);

// Student: get my invoices
router.get('/me', invoiceController.getMyInvoices);

// Get all invoices (with filters) – accessible by instructors/admins, but service applies role filters
router.get(
  '/',
  authorize('instructor', 'admin'),
  validate(getInvoicesQuerySchema),
  invoiceController.getAllInvoices
);

// Get invoice by ID – permission checked in service
router.get(
  '/:id',
  validate(getInvoiceParamsSchema),
  invoiceController.getInvoiceById
);

// Admin-only routes
router.use(authorize('admin'));

router.post(
  '/',
  validate(createInvoiceSchema),
  invoiceController.createInvoice
);

router.patch(
  '/:id',
  validate(updateInvoiceSchema),
  invoiceController.updateInvoice
);

router.patch(
  '/:id/mark-paid',
  invoiceController.markAsPaid
);

router.delete(
  '/:id',
  validate(deleteInvoiceParamsSchema),
  invoiceController.deleteInvoice
);

export default router;