import { Router } from 'express';
import { syllabusItemController } from '../controllers/syllabusItem.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createItemSchema,
  updateItemSchema,
  getItemParamsSchema,
  getItemsBySectionQuerySchema,
  deleteItemParamsSchema,
} from '../validations/syllabusItem';

const router = Router();

// Public: anyone can view items (for a published course)
router.get(
  '/',
  validate(getItemsBySectionQuerySchema),
  syllabusItemController.getItemsBySection
);

router.get(
  '/:id',
  validate(getItemParamsSchema),
  syllabusItemController.getItemById
);

// Protected: instructors/admins can manage items
router.use(authenticate, authorize('instructor', 'admin'));

router.post(
  '/',
  validate(createItemSchema),
  syllabusItemController.createItem
);

router.patch(
  '/:id',
  validate(updateItemSchema),
  syllabusItemController.updateItem
);

router.delete(
  '/:id',
  validate(deleteItemParamsSchema),
  syllabusItemController.deleteItem
);

export default router;