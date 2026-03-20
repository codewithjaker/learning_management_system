// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { progressService } from '../services/progress.service';

export class ProgressController {
  async upsertProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const progress = await progressService.upsertProgress(req.body, userId, userRole);
      res.status(200).json(progress); // 200 even if created, but we can send 201 if new
    } catch (error) {
      next(error);
    }
  }

  async getProgressById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const progress = await progressService.getProgressById(id);
      // Permission check
      await progressService.checkProgressPermission(id, req.user.id, req.user.role);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async getProgressByUserAndCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.query.userId);
      const courseId = Number(req.query.courseId);
      const result = await progressService.getProgressByUserAndCourse(
        userId,
        courseId,
        req.query as any,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProgressByItem(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = Number(req.query.itemId);
      // Only admins or instructors (for their courses) can view who completed an item
      if (req.user.role === 'student') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const result = await progressService.getProgressByItem(itemId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const progress = await progressService.updateProgress(id, req.body, req.user.id, req.user.role);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async deleteProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await progressService.deleteProgress(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getOverallProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const courseId = Number(req.params.courseId);
      const result = await progressService.getOverallProgress(
        userId,
        courseId,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyProgressInCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = Number(req.params.courseId);
      const result = await progressService.getProgressByUserAndCourse(
        req.user.id,
        courseId,
        req.query as any,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const progressController = new ProgressController();