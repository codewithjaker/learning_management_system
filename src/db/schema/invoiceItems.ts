import { pgTable, serial, integer, text, decimal, timestamp, index } from 'drizzle-orm/pg-core';
import { invoices } from './invoices';

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  courseName: text("course_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  invoiceIdx: index("invoice_items_invoice_idx").on(table.invoiceId),
}));

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;