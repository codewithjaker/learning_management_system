import { pgTable, serial, integer, text, timestamp, decimal } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes';

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull().default('multiple_choice'), // multiple_choice, true_false, short_answer
  points: decimal('points', { precision: 5, scale: 2 }).notNull().default('1'),
  orderIndex: integer('order_index').notNull().default(0),
  explanation: text('explanation'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});