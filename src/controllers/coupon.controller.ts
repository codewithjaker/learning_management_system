//@ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class CouponController {
  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async getAllCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await couponService.getAllCoupons(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCouponById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const coupon = await couponService.getCouponById(id);
      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async getCouponByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const coupon = await couponService.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const coupon = await couponService.updateCoupon(id, req.body);
      res.json(coupon);
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await couponService.deleteCoupon(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, courseId } = req.query as { code: string; courseId?: string };
      const coupon = await couponService.validateCoupon(
        code,
        courseId ? Number(courseId) : undefined
      );
      res.json({ valid: true, coupon });
    } catch (error) {
      // Return a structured error response for validation failures
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return res.status(400).json({ valid: false, message: error.message });
      }
      next(error);
    }
  }
}

export const couponController = new CouponController();