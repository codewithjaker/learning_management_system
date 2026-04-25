import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserParamsSchema,
  getUsersQuerySchema,
  deleteUserParamsSchema,
} from '../validations/user.validation';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Admin-only: create, update, delete, stats
router.post(
  '/',
  authorize('admin'),
  validate(createUserSchema),
  userController.createUser
);

router.get(
  '/',
  authorize('admin'),
  validate(getUsersQuerySchema),
  userController.getAllUsers
);

router.get(
  '/stats',
  authorize('admin'),
  userController.getUserStats
);

router.get(
  '/instructors',
  userController.getInstructors // accessible to all authenticated
);

router.get(
  '/:id',
  validate(getUserParamsSchema),
  userController.getUserById
);

router.patch(
  '/:id',
  authorize('admin'),
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(deleteUserParamsSchema),
  userController.deleteUser
);

export default router;