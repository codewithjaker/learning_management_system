import { Router } from 'express';
import { invoiceItemController } from '../controllers/invoiceItem.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createInvoiceItemSchema,
  updateInvoiceItemSchema,
  getInvoiceItemParamsSchema,
  getInvoiceItemsQuerySchema,
  deleteInvoiceItemParamsSchema,
} from '../validations/invoiceItem';

const router = Router();

// All invoice item routes require authentication
router.use(authenticate);

// Get items by invoice – accessible by invoice owner, instructor of course, admin
router.get(
  '/',
  validate(getInvoiceItemsQuerySchema),
  invoiceItemController.getInvoiceItemsByInvoice
);

// Get item by ID
router.get(
  '/:id',
  validate(getInvoiceItemParamsSchema),
  invoiceItemController.getInvoiceItemById
);

// Admin-only routes for modifying invoice items
router.use(authorize('admin'));

router.post(
  '/',
  validate(createInvoiceItemSchema),
  invoiceItemController.createInvoiceItem
);

router.patch(
  '/:id',
  validate(updateInvoiceItemSchema),
  invoiceItemController.updateInvoiceItem
);

router.delete(
  '/:id',
  validate(deleteInvoiceItemParamsSchema),
  invoiceItemController.deleteInvoiceItem
);

export default router;