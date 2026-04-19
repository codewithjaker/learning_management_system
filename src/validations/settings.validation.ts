import { z } from 'zod';

export const systemSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteLogo: z.string().nullable().optional(),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  enableRegistration: z.boolean().optional(),
  enableEmailVerification: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
});

export const createSystemSettingsSchema = systemSettingsSchema; // for create (optional fields get defaults)
export const createEmailSettingsSchema = emailSettingsSchema;

export type CreateSystemSettingsInput = z.infer<typeof createSystemSettingsSchema>;
export type UpdateSystemSettingsInput = z.infer<typeof systemSettingsSchema>;
export type CreateEmailSettingsInput = z.infer<typeof createEmailSettingsSchema>;
export type UpdateEmailSettingsInput = z.infer<typeof emailSettingsSchema>;