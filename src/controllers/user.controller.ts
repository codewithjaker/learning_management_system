import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { NotFoundError } from '../utils/errors';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAllUsers(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const user = await userService.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getUserStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getInstructors(req: Request, res: Response, next: NextFunction) {
    try {
      const instructors = await userService.getInstructors();
      res.json(instructors);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();