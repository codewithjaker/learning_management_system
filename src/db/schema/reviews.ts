import { pgTable, serial, integer, text, decimal, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

export const courseReviews = pgTable('course_reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  rating: decimal('rating', { precision: 2, scale: 1 }).notNull(), // e.g., 4.5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userCourseUnique: unique().on(table.userId, table.courseId), // one review per user per course
  courseIdx: index('reviews_course_idx').on(table.courseId),
}));

export type CourseReview = typeof courseReviews.$inferSelect;
export type NewCourseReview = typeof courseReviews.$inferInsert;
