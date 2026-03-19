import { pgTable, serial, text, integer, timestamp, boolean, decimal, pgEnum, index } from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { couponTypeEnum } from './enums';

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: couponTypeEnum('type').notNull(),
  value: decimal('value', { precision: 5, scale: 2 }).notNull(), // percentage or fixed amount
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }), // null for global
  maxUses: integer('max_uses'),                                 // null = unlimited
  usedCount: integer('used_count').notNull().default(0),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  codeIdx: index('coupons_code_idx').on(table.code),
  courseIdx: index('coupons_course_idx').on(table.courseId),
}));

export type  Coupon = typeof coupons.$inferSelect