import { Request, Response, NextFunction } from 'express';
import { syllabusItemService } from '../services/syllabusItem.service';

export class SyllabusItemController {
  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const item = await syllabusItemService.createItem(req.body, userId, userRole);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async getItemsBySection(req: Request, res: Response, next: NextFunction) {
    try {
      const sectionId = Number(req.query.sectionId);
      const result = await syllabusItemService.getItemsBySection(sectionId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const item = await syllabusItemService.getItemById(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      const item = await syllabusItemService.updateItem(id, req.body, userId, userRole);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      await syllabusItemService.deleteItem(id, userId, userRole);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const syllabusItemController = new SyllabusItemController();