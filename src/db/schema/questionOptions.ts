import { pgTable, serial, integer, text, boolean } from 'drizzle-orm/pg-core';
import { quizQuestions } from './quizQuestions';

export const questionOptions = pgTable('question_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').references(() => quizQuestions.id, { onDelete: 'cascade' }).notNull(),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false),
  orderIndex: integer('order_index').notNull().default(0),
});