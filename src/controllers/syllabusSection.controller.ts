import { Request, Response, NextFunction } from 'express';
import { syllabusSectionService } from '../services/syllabusSection.service';

export class SyllabusSectionController {
  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const section = await syllabusSectionService.createSection(req.body, userId, userRole);
      res.status(201).json(section);
    } catch (error) {
      next(error);
    }
  }

  async getSectionsByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = Number(req.query.courseId);
      const result = await syllabusSectionService.getSectionsByCourse(courseId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSectionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const section = await syllabusSectionService.getSectionById(id);
      res.json(section);
    } catch (error) {
      next(error);
    }
  }

  async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      const section = await syllabusSectionService.updateSection(id, req.body, userId, userRole);
      res.json(section);
    } catch (error) {
      next(error);
    }
  }

  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      await syllabusSectionService.deleteSection(id, userId, userRole);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const syllabusSectionController = new SyllabusSectionController();