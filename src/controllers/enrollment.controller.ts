import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollment.service';
import { courses } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

export class EnrollmentController {
  async createEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const enrollment = await enrollmentService.createEnrollment(req.body, userId, userRole);
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async getAllEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const result = await enrollmentService.getAllEnrollments(req.query as any, userId, userRole);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const enrollment = await enrollmentService.getEnrollmentById(id);
      // Additional permission check: students can only see their own; instructors only for their courses
      if (req.user.role === 'student' && enrollment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (req.user.role === 'instructor') {
        // Check if instructor owns the course
        const courseCheck = await db
          .select({ instructorId: courses.instructorId })
          .from(courses)
          .where(eq(courses.id, enrollment.courseId))
          .limit(1);
        if (!courseCheck.length || courseCheck[0].instructorId !== req.user.id) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async updateEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      const enrollment = await enrollmentService.updateEnrollment(id, req.body, userId, userRole);
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async deleteEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      await enrollmentService.deleteEnrollment(id, userId, userRole);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async completeEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      const enrollment = await enrollmentService.completeEnrollment(id, userId, userRole);
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  async getMyEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await enrollmentService.getAllEnrollments(
        { ...req.query, userId } as any,
        userId,
        'student'
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentController = new EnrollmentController();