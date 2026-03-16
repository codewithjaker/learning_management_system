import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { userService } from '../services/user.service';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedError();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await userService.getUserById(decoded.id);
    if (!user) throw new UnauthorizedError();

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError());
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};