import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewParamsSchema,
  getReviewsByCourseQuerySchema,
  getReviewsByUserQuerySchema,
  getUserReviewParamsSchema,
  deleteReviewParamsSchema,
} from '../validations/review.validation';

const router = Router();

// Public routes – anyone can view reviews for a course
router.get(
  '/course',
  validate(getReviewsByCourseQuerySchema),
  reviewController.getReviewsByCourse
);

router.get(
  '/:id',
  validate(getReviewParamsSchema),
  reviewController.getReviewById
);

// All remaining routes require authentication
router.use(authenticate);

// Student: get my review for a specific course
router.get(
  '/me/course/:courseId',
  reviewController.getMyReviewForCourse
);

// Get reviews by user (admin/instructor/self)
router.get(
  '/user',
  validate(getReviewsByUserQuerySchema),
  reviewController.getReviewsByUser
);

// Get a specific user's review for a course
router.get(
  '/user/:userId/course/:courseId',
  validate(getUserReviewParamsSchema),
  reviewController.getUserReview
);

// Create review (students can only create their own)
router.post(
  '/',
  validate(createReviewSchema),
  reviewController.createReview
);

// Update review (owner or admin)
router.patch(
  '/:id',
  validate(updateReviewSchema),
  reviewController.updateReview
);

// Delete review (owner or admin)
router.delete(
  '/:id',
  validate(deleteReviewParamsSchema),
  reviewController.deleteReview
);

export default router;