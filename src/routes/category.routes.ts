import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryParamsSchema,
  getCategoryBySlugParamsSchema,
  getCategoriesQuerySchema,
  deleteCategoryParamsSchema,
} from '../validations/category';

const router = Router();

// Public routes – anyone can view categories
router.get(
  '/',
  validate(getCategoriesQuerySchema),
  categoryController.getAllCategories
);

router.get(
  '/slug/:slug',
  validate(getCategoryBySlugParamsSchema),
  categoryController.getCategoryBySlug
);

router.get(
  '/:id',
  validate(getCategoryParamsSchema),
  categoryController.getCategoryById
);

// Admin-only routes
router.use(authenticate, authorize('admin'));

router.post(
  '/',
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  '/:id',
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  validate(deleteCategoryParamsSchema),
  categoryController.deleteCategory
);

export default router;