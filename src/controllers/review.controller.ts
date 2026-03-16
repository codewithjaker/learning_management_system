import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const review = await reviewService.createReview(req.body, userId, userRole);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const review = await reviewService.getReviewById(id);
      // Basic permission: students can only see their own reviews? Actually reviews are public for a course.
      // We'll let anyone view a review by ID, but controller could check if user is allowed.
      // For simplicity, we'll just return it.
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = Number(req.query.courseId);
      const result = await reviewService.getReviewsByCourse(courseId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.query.userId);
      // Only admins and instructors (for their courses) can view reviews by user
      if (req.user.role === 'student' && userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const result = await reviewService.getReviewsByUser(userId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.userId);
      const courseId = Number(req.params.courseId);
      // Students can only get their own review
      if (req.user.role === 'student' && userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const review = await reviewService.getUserReview(userId, courseId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const review = await reviewService.updateReview(id, req.body, req.user.id, req.user.role);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await reviewService.deleteReview(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getMyReviewForCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = Number(req.params.courseId);
      const review = await reviewService.getUserReview(req.user.id, courseId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      res.json(review);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();