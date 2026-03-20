import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  uuid,
  integer,
  jsonb,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { courseLevelEnum, courseStatusEnum } from "./enums";
import { categories } from "./categories";

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),

    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),

    subtitle: text("subtitle"),
    description: text("description").notNull(),
    fullDescription: text("full_description"),

    image: text("image").notNull(),
    previewVideoUrl: text("preview_video_url"),

    level: courseLevelEnum("level").notNull().default("all-levels"),
    categoryId: integer("category_id")
      .references(() => categories.id)
      .notNull(),

    tags: jsonb("tags").$type<string[]>().default([]),

    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),

    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    totalReviews: integer("total_reviews").default(0),

    duration: integer("duration"),

    featured: boolean("featured").default(false),
    isNew: boolean("is_new").default(true),
    isBestseller: boolean("is_bestseller").default(false),

    certification: text("certification"),

    /* Course learning information */

    requirements: jsonb("requirements").$type<string[]>().default([]),
    learningOutcomes: jsonb("learning_outcomes").$type<string[]>().default([]),
    targetAudience: jsonb("target_audience").$type<string[]>().default([]),
    language: text("language"),

    /* Course extras */

    courseProjects: jsonb("course_projects").$type<string[]>().default([]),
    courseSoftware: jsonb("course_software").$type<string[]>().default([]),
    courseFeatures: jsonb("course_features").$type<string[]>().default([]),

    /* Instructor */

    instructorId: integer("instructor_id")
      .references(() => users.id)
      .notNull(),

    status: courseStatusEnum("status").default("draft"),
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    instructorIdx: index("idx_courses_instructor").on(table.instructorId),
    categoryIdx: index("idx_courses_category").on(table.categoryId),
    slugIdx: index("idx_courses_slug").on(table.slug),
  }),
);

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
