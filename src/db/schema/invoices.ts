import { pgTable, serial, text, integer, decimal, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { enrollments } from './enrollments';
import { coupons } from './coupons';
import { invoiceStatusEnum } from './enums';

// Invoices table
export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),

    // Unique invoice number
    invoiceNumber: text("invoice_number").notNull().unique(),

    // User who owns this invoice
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Enrollment (optional, e.g., course registration)
    enrollmentId: integer("enrollment_id")
      .references(() => enrollments.id, { onDelete: "set null" }),

    // Coupon applied (optional)
    couponId: integer("coupon_id")
      .references(() => coupons.id, { onDelete: "set null" }),

    // Amounts
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),

    // Status of the invoice
    status: invoiceStatusEnum("status").notNull().default("pending"),

    // Timestamps
    issuedAt: timestamp("issued_at").defaultNow(),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("invoices_user_idx").on(table.userId),
    enrollmentIdx: index("invoices_enrollment_idx").on(table.enrollmentId),
    couponIdx: index("invoices_coupon_idx").on(table.couponId),
  })
);

export type Invoice = typeof invoices.$inferSelect;
export type  NewInvoice = typeof invoices.$inferInsert;
 