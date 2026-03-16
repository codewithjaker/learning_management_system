import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { syllabusSections } from "./syllabusSections";
import { itemTypeEnum } from "./enums";

export const syllabusItems = pgTable(
  "syllabus_items",
  {
    // id: uuid("id").primaryKey().defaultRandom(),
    id: serial("id").primaryKey(),
    // sectionId: uuid("section_id")
    //   .references(() => syllabusSections.id, { onDelete: "cascade" })
    //   .notNull(),
    sectionId: integer("section_id")
      .references(() => syllabusSections.id)
      .notNull(),
    title: text("title").notNull(),
    type: itemTypeEnum("type").notNull(), // video, article, quiz
    content: text("content"), // video URL, article JSON, quiz data
    duration: integer("duration"), // seconds
    isFree: boolean("is_free").notNull().default(false), // preview
    orderIndex: integer("order_index").notNull(), // lesson order in section
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    sectionIdx: index("idx_syllabus_items_section").on(table.sectionId),
  }),
);

export type SyllabusItem = typeof syllabusItems.$inferSelect;
export type NewSyllabusItem = typeof syllabusItems.$inferInsert;
