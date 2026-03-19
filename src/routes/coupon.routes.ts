import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createCouponSchema,
  updateCouponSchema,
  getCouponParamsSchema,
  getCouponByCodeParamsSchema,
  getCouponsQuerySchema,
  validateCouponQuerySchema,
  deleteCouponParamsSchema,
} from '../validations/coupon';

const router = Router();

// Public route: validate a coupon (no authentication required)
router.get(
  '/validate',
  validate(validateCouponQuerySchema),
  couponController.validateCoupon
);

// All following routes require authentication
router.use(authenticate);

// Get coupon by code (any authenticated user can look up a coupon)
router.get(
  '/code/:code',
  validate(getCouponByCodeParamsSchema),
  couponController.getCouponByCode
);

// Admin-only routes
router.use(authorize('admin'));

router.post(
  '/',
  validate(createCouponSchema),
  couponController.createCoupon
);

router.get(
  '/',
  validate(getCouponsQuerySchema),
  couponController.getAllCoupons
);

router.get(
  '/:id',
  validate(getCouponParamsSchema),
  couponController.getCouponById
);

router.patch(
  '/:id',
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  '/:id',
  validate(deleteCouponParamsSchema),
  couponController.deleteCoupon
);

export default router;