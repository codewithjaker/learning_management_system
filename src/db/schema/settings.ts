import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  siteName: text('site_name').notNull().default('LMS Platform'),
  siteLogo: text('site_logo'),
  siteDescription: text('site_description').notNull().default('Learning Management System'),
  contactEmail: text('contact_email').notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  dateFormat: text('date_format').notNull().default('YYYY-MM-DD'),
  currency: text('currency').notNull().default('USD'),
  enableRegistration: boolean('enable_registration').notNull().default(true),
  enableEmailVerification: boolean('enable_email_verification').notNull().default(true),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
