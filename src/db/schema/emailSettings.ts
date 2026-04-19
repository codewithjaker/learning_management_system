import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

export const emailSettings = pgTable('email_settings', {
  id: serial('id').primaryKey(),
  smtpHost: text('smtp_host').notNull(),
  smtpPort: integer('smtp_port').notNull().default(587),
  smtpSecure: boolean('smtp_secure').notNull().default(false),
  smtpUser: text('smtp_user').notNull(),
  smtpPass: text('smtp_pass').notNull(),
  fromEmail: text('from_email').notNull(),
  fromName: text('from_name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export type EmailSetting = typeof emailSettings.$inferSelect;
export type NewEmailSetting = typeof emailSettings.$inferInsert;
