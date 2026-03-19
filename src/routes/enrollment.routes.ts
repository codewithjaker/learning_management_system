import { Router } from 'express';
import { enrollmentController } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  getEnrollmentParamsSchema,
  getEnrollmentsQuerySchema,
  deleteEnrollmentParamsSchema,
  completeEnrollmentSchema,
} from '../validations/enrollment.validation';

const router = Router();

// All enrollment routes require authentication
router.use(authenticate);

// Student-specific: get my enrollments
router.get(
  '/me',
  authorize('student', 'instructor', 'admin'), // but controller filters for student
  enrollmentController.getMyEnrollments
);

// Get all enrollments (with filters) – accessible by instructors/admins, but service applies role filters
router.get(
  '/',
  authorize('instructor', 'admin'),
  validate(getEnrollmentsQuerySchema),
  enrollmentController.getAllEnrollments
);

// Get a specific enrollment by ID – accessible by owner, instructor of course, admin
router.get(
  '/:id',
  validate(getEnrollmentParamsSchema),
  enrollmentController.getEnrollmentById
);

// Create enrollment – students can enroll themselves, instructors/admins can enroll any student
router.post(
  '/',
  validate(createEnrollmentSchema),
  enrollmentController.createEnrollment
);

// Update enrollment (status, completedAt) – instructors (for their courses) and admins
router.patch(
  '/:id',
  authorize('instructor', 'admin'),
  validate(updateEnrollmentSchema),
  enrollmentController.updateEnrollment
);

// Complete enrollment – students can complete their own active enrollment
router.patch(
  '/:id/complete',
  validate(completeEnrollmentSchema),
  enrollmentController.completeEnrollment
);

// Delete enrollment – admin only (or instructor for their courses, we allowed in service)
router.delete(
  '/:id',
  authorize('admin', 'instructor'),
  validate(deleteEnrollmentParamsSchema),
  enrollmentController.deleteEnrollment
);

export default router;