import {
  pgTable,
  serial,
  integer,
  decimal,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),

    // Linked invoice
    invoiceId: integer("invoice_id")
      .references(() => invoices.id, { onDelete: "cascade" })
      .notNull(),

    // Amount paid
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

    // Payment method
    paymentMethod: paymentMethodEnum("payment_method").notNull(),

    // Payment gateway transaction ID
    transactionId: text("transaction_id"),

    // Optional raw gateway response (JSON)
    gatewayResponse: text("gateway_response"),

    // Unique receipt number
    receiptNumber: text("receipt_number").unique(),

    // Payment status
    status: paymentStatusEnum("status").notNull().default("pending"),

    // Paid timestamp
    paidAt: timestamp("paid_at"),

    installmentNumber: integer("installment_number"), // optional for partial payments
    
    note: text("note"), // optional

    // Record timestamps
    createdAt: timestamp("created_at").defaultNow(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    invoiceIdx: index("payments_invoice_idx").on(table.invoiceId),
    transactionIdx: index("payments_transaction_idx").on(table.transactionId),
    receiptIdx: index("payments_receipt_idx").on(table.receiptNumber),
  }),
);


export type Payment = typeof payments.$inferSelect;
 