import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    fullName: text("full_name").notNull(),
    bio: text("bio"), // for instructors
    avatar: text("avatar"),
    role: userRoleEnum("role").notNull().default("student"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
