import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['student', 'instructor', 'admin']);
export const courseLevelEnum = pgEnum('course_level', ['beginner', 'intermediate', 'advanced', 'all-levels']);
export const courseStatusEnum = pgEnum("course_status", [
  "draft",
  "published",
  "archived",
]);
export const itemTypeEnum = pgEnum('item_type', ['video', 'article', 'quiz', 'coding', 'exercise', 'resource',"assignment"]);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'completed', 'refunded']);
export const paymentMethodEnum = pgEnum("payment_method", [
  "sslcommerz",       // Handles bKash, Nagad, Rocket, card, bank internally
  "stripe",           // International card payments
  "paypal",           // International online wallet
  "cash",             // Offline payment
  "bank_transfer",    // Manual bank transfer
]);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'paid', 'failed']);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed']);
// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "paid",
  "refunded",
  "cancelled",
]);