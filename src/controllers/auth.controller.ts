// import { Request, Response, NextFunction } from 'express';
// import { authService } from '../services/auth.service';

// export class AuthController {
//   async register(req: Request, res: Response, next: NextFunction) {
//     try {
//       const result = await authService.register(req.body);
//       res.status(201).json(result);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async login(req: Request, res: Response, next: NextFunction) {
//     try {
//       const result = await authService.login(req.body);
//       res.json(result);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getMe(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.json({ user: req.user });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// export const authController = new AuthController();

// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body, req.headers['user-agent'], req.ip);
      res.status(201).json(result);
    } catch (error) { next(error); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body, req.headers['user-agent'], req.ip);
      res.json(result);
    } catch (error) { next(error); }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
      if (refreshToken) await authService.logout(refreshToken);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
      await authService.logoutAll(req.user.id, refreshToken);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) { next(error); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) { next(error); }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyOtp(email, otp);
      res.json(result);
    } catch (error) { next(error); }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.resendOtp(email);
      res.json(result);
    } catch (error) { next(error); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await authService.resetPassword(email, otp, newPassword);
      res.json(result);
    } catch (error) { next(error); }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.json(result);
    } catch (error) { next(error); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token as string);
      res.json(result);
    } catch (error) { next(error); }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification(email);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await authService.getUserSessions(req.user.id);
      res.json(sessions);
    } catch (error) { next(error); }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id);
      await authService.revokeSession(req.user.id, sessionId);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export const authController = new AuthController();