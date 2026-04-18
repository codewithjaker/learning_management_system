import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueData(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await dashboardService.getRevenueData(months);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentData(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      const data = await dashboardService.getEnrollmentData(months);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await dashboardService.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();