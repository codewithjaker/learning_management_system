import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  getCourseParamsSchema,
  getCourseBySlugParamsSchema,
  getCoursesQuerySchema,
  deleteCourseParamsSchema,
  publishCourseSchema,
  updateCourseStatsSchema,
} from '../validations/course.validation';

const router = Router();

// Public routes – anyone can view published courses
router.get(
  '/',
  validate(getCoursesQuerySchema),
  courseController.getAllCourses
);

router.get(
  '/slug/:slug',
  validate(getCourseBySlugParamsSchema),
  courseController.getCourseBySlug
);

router.get(
  '/instructor/:instructorId',
  courseController.getCoursesByInstructor
);

router.get(
  '/:id',
  validate(getCourseParamsSchema),
  courseController.getCourseById
);

// Routes for authenticated users (students, instructors, admins)
router.use(authenticate);

// Instructors can create courses
router.post(
  '/',
  authorize('instructor', 'admin'),
  validate(createCourseSchema),
  courseController.createCourse
);

// Instructors can update/delete/publish their own courses; admins any
router.patch(
  '/:id',
  authorize('instructor', 'admin'),
  validate(updateCourseSchema),
  courseController.updateCourse
);

router.delete(
  '/:id',
  authorize('instructor', 'admin'),
  validate(deleteCourseParamsSchema),
  courseController.deleteCourse
);

router.patch(
  '/:id/publish',
  authorize('instructor', 'admin'),
  validate(publishCourseSchema),
  courseController.publishCourse
);

// Admin-only routes for stats updates
router.patch(
  '/:id/stats',
  authorize('admin'),
  validate(updateCourseStatsSchema),
  courseController.updateCourseStats
);

export default router;