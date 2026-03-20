import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  upsertProgressSchema,
  updateProgressSchema,
  getProgressParamsSchema,
  getProgressByUserAndCourseQuerySchema,
  getProgressByItemQuerySchema,
  deleteProgressParamsSchema,
} from '../validations/progress.validation';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

// Student: get my progress in a specific course
router.get(
  '/me/course/:courseId',
  progressController.getMyProgressInCourse
);

// Get overall progress summary for a user in a course
router.get(
  '/overview/:userId/:courseId',
  progressController.getOverallProgress
);

// Get progress by user and course (with details)
router.get(
  '/',
  validate(getProgressByUserAndCourseQuerySchema),
  progressController.getProgressByUserAndCourse
);

// Get progress by item (who completed) – instructors/admins only
router.get(
  '/by-item',
  authorize('instructor', 'admin'),
  validate(getProgressByItemQuerySchema),
  progressController.getProgressByItem
);

// Get specific progress record by ID
router.get(
  '/:id',
  validate(getProgressParamsSchema),
  progressController.getProgressById
);

// Upsert progress (create or update) – used when watching video or completing item
router.post(
  '/',
  validate(upsertProgressSchema),
  progressController.upsertProgress
);

// Update progress record by ID
router.patch(
  '/:id',
  validate(updateProgressSchema),
  progressController.updateProgress
);

// Delete progress record – admin only
router.delete(
  '/:id',
  authorize('admin'),
  validate(deleteProgressParamsSchema),
  progressController.deleteProgress
);

export default router;