import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { z } from 'zod';
import { createEmailSettingsSchema, createSystemSettingsSchema, emailSettingsSchema, systemSettingsSchema } from '../validations/settings.validation';


const router = Router();
router.use(authenticate);

// Profile
router.get('/profile', settingsController.getProfile);
router.put('/profile', validate(z.object({ body: z.object({ fullName: z.string().optional(), bio: z.string().nullable().optional(), avatar: z.string().nullable().optional() }) })), settingsController.updateProfile);

// Password
router.post('/change-password', validate(z.object({ body: z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6) }) })), settingsController.changePassword);


// System Settings (admin only)
router.use('/system', authorize('admin'));
router.get('/system', settingsController.getSystemSettings);
router.post('/system', validate(createSystemSettingsSchema), settingsController.createSystemSettings);
router.put('/system', validate(systemSettingsSchema), settingsController.updateSystemSettings);
router.delete('/system', settingsController.deleteSystemSettings);

// Email Settings (admin only)
router.use('/email', authorize('admin'));
router.get('/email', settingsController.getEmailSettings);
router.post('/email', validate(createEmailSettingsSchema), settingsController.createEmailSettings);
router.put('/email', validate(emailSettingsSchema), settingsController.updateEmailSettings);
router.delete('/email', settingsController.deleteEmailSettings);


// Sessions
router.get('/sessions', settingsController.getUserSessions);
router.delete('/sessions/:id', settingsController.revokeSession);

export default router;