import { pgTable, serial, integer, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { quizAttempts } from './quizAttempts';
import { quizQuestions } from './quizQuestions';
import { questionOptions } from './questionOptions';

export const quizAnswers = pgTable('quiz_answers', {
  id: serial('id').primaryKey(),
  attemptId: integer('attempt_id').references(() => quizAttempts.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer('question_id').references(() => quizQuestions.id, { onDelete: 'cascade' }).notNull(),
  selectedOptionId: integer('selected_option_id').references(() => questionOptions.id, { onDelete: 'set null' }),
  textAnswer: text('text_answer'), // for short answer
  isCorrect: boolean('is_correct'),
  pointsEarned: decimal('points_earned', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});