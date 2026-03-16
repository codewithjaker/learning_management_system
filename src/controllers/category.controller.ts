import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.getAllCategories(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await categoryService.getCategoryById(id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      // @ts-ignore
      const category = await categoryService.getCategoryBySlug(slug);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await categoryService.updateCategory(id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await categoryService.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();