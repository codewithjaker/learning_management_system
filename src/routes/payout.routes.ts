import { Router } from 'express';
import { payoutController } from '../controllers/payout.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createPayoutSchema,
  updatePayoutSchema,
  getPayoutParamsSchema,
  getPayoutsQuerySchema,
  deletePayoutParamsSchema,
} from '../validations/payout.validation';

const router = Router();

// All payout routes require authentication
router.use(authenticate);

// Instructor routes: get my payouts and earnings
router.get('/me', payoutController.getMyPayouts);
router.get('/me/total', payoutController.getMyTotalEarnings);

// Get payouts by instructor (admin or that instructor)
router.get(
  '/instructor/:instructorId',
  payoutController.getPayoutsByInstructor
);

// Get total earnings for an instructor (admin or that instructor)
router.get(
  '/instructor/:instructorId/total',
  payoutController.getTotalEarnings
);

// Admin-only routes
router.use(authorize('admin'));

router.post(
  '/',
  validate(createPayoutSchema),
  payoutController.createPayout
);

router.get(
  '/',
  validate(getPayoutsQuerySchema),
  payoutController.getAllPayouts
);

router.get(
  '/:id',
  validate(getPayoutParamsSchema),
  payoutController.getPayoutById
);

router.patch(
  '/:id',
  validate(updatePayoutSchema),
  payoutController.updatePayout
);

router.delete(
  '/:id',
  validate(deletePayoutParamsSchema),
  payoutController.deletePayout
);

export default router;