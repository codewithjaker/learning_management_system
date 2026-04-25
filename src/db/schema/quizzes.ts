import { pgTable, serial, integer, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { syllabusItems } from './syllabusItems';

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  syllabusItemId: integer('syllabus_item_id').references(() => syllabusItems.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  timeLimit: integer('time_limit'), // in minutes, null = unlimited
  passingScore: decimal('passing_score', { precision: 5, scale: 2 }).notNull().default('70'),
  maxAttempts: integer('max_attempts').default(1),
  shuffleQuestions: boolean('shuffle_questions').default(false),
  showResults: boolean('show_results').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;



