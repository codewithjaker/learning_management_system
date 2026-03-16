import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(), // for URLs
  description: text("description"),
  icon: text("icon"), // optional, e.g., FontAwesome icon name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Category = typeof categories.$inferSelect;
// export type NewUser = typeof users.$inferInsert;