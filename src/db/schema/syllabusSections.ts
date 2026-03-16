import { pgTable, uuid, text, integer, timestamp, index, serial } from "drizzle-orm/pg-core";
import { courses } from "./courses";

export const syllabusSections = pgTable(
  "syllabus_sections",
  {
    id: serial('id').primaryKey(),
    courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
    title: text("title").notNull(),               // Module name
    orderIndex: integer("order_index").notNull(), // Order of module in course
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    courseIdx: index("idx_syllabus_sections_course").on(table.courseId),
  }),
);

export type SyllabusSection = typeof syllabusSections.$inferSelect;
export type NewSyllabusSection = typeof syllabusSections.$inferInsert;