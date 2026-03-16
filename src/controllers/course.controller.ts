// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/course.service';

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseService.getAllCourses(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const course = await courseService.getCourseById(id);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      
      const course = await courseService.getCourseBySlug(slug);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      const course = await courseService.updateCourse(id, req.body, userId, userRole);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      await courseService.deleteCourse(id, userId, userRole);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async publishCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      const course = await courseService.publishCourse(id, userId, userRole);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  async getCoursesByInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = Number(req.params.instructorId);
      const courses = await courseService.getCoursesByInstructor(instructorId);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }

  // Admin-only: update stats
  async updateCourseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const course = await courseService.updateCourseStats(id, req.body);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();