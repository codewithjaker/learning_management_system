import { pgTable, serial, integer, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { users } from './users';
import { quizzes } from './quizzes';

export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  submittedAt: timestamp('submitted_at'),
  score: decimal('score', { precision: 5, scale: 2 }),
  passed: boolean('passed'),
  status: text('status').notNull().default('in_progress'), // in_progress, submitted, graded
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});