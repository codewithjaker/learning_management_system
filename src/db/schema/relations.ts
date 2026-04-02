import { relations } from 'drizzle-orm';
import * as tables from './index'; // all tables re-exported

// ========================= USERS =========================
export const usersRelations = relations(tables.users, ({ many }) => ({
  sessions: many(tables.sessions),  
  coursesTeaching: many(tables.courses, { relationName: 'instructor' }),
  enrollments: many(tables.enrollments),
  progress: many(tables.userItemProgress),
  reviews: many(tables.courseReviews),
  invoices: many(tables.invoices),
  payouts: many(tables.payouts),
}));


// ========================= COURSES =========================
export const coursesRelations = relations(tables.courses, ({ one, many }) => ({
  instructor: one(tables.users, { fields: [tables.courses.instructorId], references: [tables.users.id], relationName: 'instructor' }),
  category: one(tables.categories, { fields: [tables.courses.categoryId], references: [tables.categories.id] }),
  sections: many(tables.syllabusSections),
  enrollments: many(tables.enrollments),
  reviews: many(tables.courseReviews),
  coupons: many(tables.coupons),
}));

// ========================= SYLLABUS SECTIONS =========================
export const syllabusSectionsRelations = relations(tables.syllabusSections, ({ one, many }) => ({
  course: one(tables.courses, { fields: [tables.syllabusSections.courseId], references: [tables.courses.id] }),
  items: many(tables.syllabusItems),
}));

// ========================= SYLLABUS ITEMS =========================
export const syllabusItemsRelations = relations(tables.syllabusItems, ({ one, many }) => ({
  section: one(tables.syllabusSections, { fields: [tables.syllabusItems.sectionId], references: [tables.syllabusSections.id] }),
  progress: many(tables.userItemProgress),
}));

// ========================= ENROLLMENTS =========================
export const enrollmentsRelations = relations(tables.enrollments, ({ one, many }) => ({
  user: one(tables.users, { fields: [tables.enrollments.userId], references: [tables.users.id] }),
  course: one(tables.courses, { fields: [tables.enrollments.courseId], references: [tables.courses.id] }),
  invoices: many(tables.invoices),
}));

// ========================= USER ITEM PROGRESS =========================
export const userItemProgressRelations = relations(tables.userItemProgress, ({ one }) => ({
  user: one(tables.users, { fields: [tables.userItemProgress.userId], references: [tables.users.id] }),
  item: one(tables.syllabusItems, { fields: [tables.userItemProgress.itemId], references: [tables.syllabusItems.id] }),
}));

// ========================= COURSE REVIEWS =========================
export const courseReviewsRelations = relations(tables.courseReviews, ({ one }) => ({
  user: one(tables.users, { fields: [tables.courseReviews.userId], references: [tables.users.id] }),
  course: one(tables.courses, { fields: [tables.courseReviews.courseId], references: [tables.courses.id] }),
}));

// ========================= COUPONS =========================
export const couponsRelations = relations(tables.coupons, ({ one, many }) => ({
  course: one(tables.courses, { fields: [tables.coupons.courseId], references: [tables.courses.id] }),
  invoices: many(tables.invoices),
}));

// ========================= INVOICES =========================
export const invoicesRelations = relations(tables.invoices, ({ one, many }) => ({
  user: one(tables.users, { fields: [tables.invoices.userId], references: [tables.users.id] }),
  enrollment: one(tables.enrollments, { fields: [tables.invoices.enrollmentId], references: [tables.enrollments.id] }),
  coupon: one(tables.coupons, { fields: [tables.invoices.couponId], references: [tables.coupons.id] }),
  payments: many(tables.payments),
  invoiceItems: many(tables.invoiceItems),
}));

// ========================= INVOICE ITEMS =========================
export const invoiceItemsRelations = relations(tables.invoiceItems, ({ one }) => ({
  invoice: one(tables.invoices, { fields: [tables.invoiceItems.invoiceId], references: [tables.invoices.id] }),
}));

// ========================= PAYMENTS =========================
export const paymentsRelations = relations(tables.payments, ({ one }) => ({
  invoice: one(tables.invoices, { fields: [tables.payments.invoiceId], references: [tables.invoices.id] }),
}));

// ========================= PAYOUTS =========================
export const payoutsRelations = relations(tables.payouts, ({ one }) => ({
  instructor: one(tables.users, { fields: [tables.payouts.instructorId], references: [tables.users.id] }),
}));