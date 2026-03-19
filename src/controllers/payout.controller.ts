import { Request, Response, NextFunction } from 'express';
import { payoutService } from '../services/payout.service';

export class PayoutController {
  async createPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const payout = await payoutService.createPayout(req.body);
      res.status(201).json(payout);
    } catch (error) {
      next(error);
    }
  }

  async getAllPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payoutService.getAllPayouts(req.query as any, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPayoutById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const payout = await payoutService.getPayoutById(id);
      // Check permission
      await payoutService['checkPayoutPermission'](id, req.user.id, req.user.role);
      res.json(payout);
    } catch (error) {
      next(error);
    }
  }

  async updatePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const payout = await payoutService.updatePayout(id, req.body, req.user.id, req.user.role);
      res.json(payout);
    } catch (error) {
      next(error);
    }
  }

  async deletePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await payoutService.deletePayout(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getPayoutsByInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = Number(req.params.instructorId);
      const payouts = await payoutService.getPayoutsByInstructor(instructorId, req.user.id, req.user.role);
      res.json(payouts);
    } catch (error) {
      next(error);
    }
  }

  async getTotalEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = Number(req.params.instructorId);
      const total = await payoutService.getTotalEarnings(instructorId, req.user.id, req.user.role);
      res.json({ instructorId, total });
    } catch (error) {
      next(error);
    }
  }

  async getMyPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const payouts = await payoutService.getPayoutsByInstructor(req.user.id, req.user.id, req.user.role);
      res.json(payouts);
    } catch (error) {
      next(error);
    }
  }

  async getMyTotalEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const total = await payoutService.getTotalEarnings(req.user.id, req.user.id, req.user.role);
      res.json({ total });
    } catch (error) {
      next(error);
    }
  }
}

export const payoutController = new PayoutController();