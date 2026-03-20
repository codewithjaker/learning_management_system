import { pgTable, serial, integer, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { syllabusItems } from './syllabusItems';

export const userItemProgress = pgTable('user_item_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  itemId: integer('item_id').references(() => syllabusItems.id, { onDelete: 'cascade' }).notNull(),
  completed: boolean('completed').notNull().default(false),
  lastPosition: integer('last_position'),   // for video, seconds
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userItemUnique: unique().on(table.userId, table.itemId),
  userIdx: index('progress_user_idx').on(table.userId),
  itemIdx: index('progress_item_idx').on(table.itemId),
}));

export type UserItemProgress = typeof userItemProgress.$inferSelect
export type NewUserItemProgress = typeof userItemProgress.$inferInsert
