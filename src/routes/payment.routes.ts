import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPaymentSchema,
  updatePaymentSchema,
  getPaymentParamsSchema,
  getPaymentsQuerySchema,
  deletePaymentParamsSchema,
  completePaymentSchema,
} from '../validations/payment';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Get payments by invoice (students can see their own invoice payments)
router.get(
  '/invoice/:invoiceId',
  paymentController.getPaymentsByInvoice
);

// Get all payments with filters (admin only due to financial data)
router.get(
  '/',
  authorize('admin'),
  validate(getPaymentsQuerySchema),
  paymentController.getAllPayments
);

// Get payment by ID (owner of invoice or admin)
router.get(
  '/:id',
  validate(getPaymentParamsSchema),
  paymentController.getPaymentById
);

// Create payment (admin only)
router.post(
  '/',
  authorize('admin'),
  validate(createPaymentSchema),
  paymentController.createPayment
);

// Update payment (admin only)
router.patch(
  '/:id',
  authorize('admin'),
  validate(updatePaymentSchema),
  paymentController.updatePayment
);

// Complete payment (webhook or admin)
router.patch(
  '/:id/complete',
  authorize('admin'), // In production, you might use a separate webhook auth
  validate(completePaymentSchema),
  paymentController.completePayment
);

// Delete payment (admin only)
router.delete(
  '/:id',
  authorize('admin'),
  validate(deletePaymentParamsSchema),
  paymentController.deletePayment
);

export default router;