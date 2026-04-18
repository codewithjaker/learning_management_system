import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export class ReportController {
  async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      const data = await reportService.getSalesReport(
        startDate as string,
        endDate as string,
        groupBy as any
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getUserReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      const data = await reportService.getUserReport(
        startDate as string,
        endDate as string,
        groupBy as any
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getCourseReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getCourseReport();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      const data = await reportService.getEnrollmentReport(
        startDate as string,
        endDate as string,
        groupBy as any
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      const data = await reportService.getPaymentReport(
        startDate as string,
        endDate as string,
        groupBy as any
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentMethodReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportService.getPaymentMethodReport(
        startDate as string,
        endDate as string
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getInstructorEarningsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getInstructorEarningsReport();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();