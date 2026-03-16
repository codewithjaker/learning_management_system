import { pgTable, serial, integer, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';
import { enrollmentStatusEnum } from './enums';

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  status: enrollmentStatusEnum('status').notNull().default('active'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userCourseUnique: unique().on(table.userId, table.courseId),
  userIdx: index('enrollments_user_idx').on(table.userId),
  courseIdx: index('enrollments_course_idx').on(table.courseId),
}));


export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;