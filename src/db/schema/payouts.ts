import { pgTable, serial, integer, decimal, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { payoutStatusEnum } from './enums';

export const payouts = pgTable('payouts', {
  id: serial('id').primaryKey(),
  instructorId: integer('instructor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  paymentMethod: text('payment_method'),
  transactionId: text('transaction_id'),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  instructorIdx: index('payouts_instructor_idx').on(table.instructorId),
}));

export type Payout = typeof payouts.$inferSelect
export type NewPayout = typeof payouts.$inferInsert