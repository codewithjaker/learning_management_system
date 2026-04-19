import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';

export class SettingsController {
    // Profile
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profile = await settingsService.getProfile(req.user.id);
            res.json(profile);
        } catch (error) { next(error); }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await settingsService.updateProfile(req.user.id, req.body);
            res.json(updated);
        } catch (error) { next(error); }
    }

    // Change password
    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await settingsService.changePassword(req.user.id, req.body);
            res.json(result);
        } catch (error) { next(error); }
    }

    //   // System settings

    //   async createSystemSettings(req: Request, res: Response, next: NextFunction) {
    //     try {
    //       const settings = await settingsService.createSystemSettings(req.body);
    //       res.status(201).json(settings);
    //     } catch (error) { next(error); }
    //   }

    //   async getSystemSettings(req: Request, res: Response, next: NextFunction) {
    //     try {
    //       const settings = await settingsService.getSystemSettings();
    //       res.json(settings);
    //     } catch (error) { next(error); }
    //   }

    //   async updateSystemSettings(req: Request, res: Response, next: NextFunction) {
    //     try {
    //       const updated = await settingsService.updateSystemSettings(req.body);
    //       res.json(updated);
    //     } catch (error) { next(error); }
    //   }

    //   // Email settings
    //   async getEmailSettings(req: Request, res: Response, next: NextFunction) {
    //     try {
    //       const settings = await settingsService.getEmailSettings();
    //       res.json(settings);
    //     } catch (error) { next(error); }
    //   }

    //   async updateEmailSettings(req: Request, res: Response, next: NextFunction) {
    //     try {
    //       const updated = await settingsService.updateEmailSettings(req.body);
    //       res.json(updated);
    //     } catch (error) { next(error); }
    //   }

    // System Settings
    async createSystemSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.createSystemSettings(req.body);
            res.status(201).json(settings);
        } catch (error) { next(error); }
    }

    async getSystemSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.getSystemSettings();
            res.json(settings);
        } catch (error) { next(error); }
    }

    async updateSystemSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.updateSystemSettings(req.body);
            res.json(settings);
        } catch (error) { next(error); }
    }

    async deleteSystemSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.deleteSystemSettings();
            res.json(settings);
        } catch (error) { next(error); }
    }

    // Email Settings
    async createEmailSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.createEmailSettings(req.body);
            res.status(201).json(settings);
        } catch (error) { next(error); }
    }

    async getEmailSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.getEmailSettings();
            res.json(settings);
        } catch (error) { next(error); }
    }

    async updateEmailSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.updateEmailSettings(req.body);
            res.json(settings);
        } catch (error) { next(error); }
    }

    async deleteEmailSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.deleteEmailSettings();
            res.json(settings);
        } catch (error) { next(error); }
    }

    // Sessions
    async getUserSessions(req: Request, res: Response, next: NextFunction) {
        try {
            const sessions = await settingsService.getUserSessions(req.user.id);
            res.json(sessions);
        } catch (error) { next(error); }
    }

    async revokeSession(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore
            const sessionId = parseInt(req.params.id);
            await settingsService.revokeSession(sessionId, req.user.id);
            res.status(204).send();
        } catch (error) { next(error); }
    }
}

export const settingsController = new SettingsController();