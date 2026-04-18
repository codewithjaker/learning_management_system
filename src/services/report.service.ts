import { db } from '../db';
import { users } from '../db/schema/users';
import { courses } from '../db/schema/courses';
import { enrollments } from '../db/schema/enrollments';
import { payments } from '../db/schema/payments';
import { payouts } from '../db/schema/payouts';
import { courseReviews } from '../db/schema/reviews';
import { invoices } from '../db/schema/invoices';
import { eq, and, sql, count, sum, avg } from 'drizzle-orm';
import {
  SalesReportData,
  UserReportData,
  CourseReportData,
  EnrollmentReportData,
  PaymentReportData,
  PaymentMethodReport,
  InstructorEarningsData,
} from '../types/report.types';

export class ReportService {
  // Helper to format period based on groupBy
  private formatPeriod(date: Date, groupBy: 'day' | 'month' | 'year'): string {
    if (groupBy === 'day') return date.toISOString().split('T')[0];
    if (groupBy === 'month') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return date.getFullYear().toString();
  }

  // ========== SALES REPORT ==========
  async getSalesReport(startDate?: string, endDate?: string, groupBy: 'day' | 'month' | 'year' = 'month'): Promise<any> {
    const whereConditions = [];
    if (startDate) whereConditions.push(sql`${payments.paidAt} >= ${startDate}`);
    if (endDate) whereConditions.push(sql`${payments.paidAt} <= ${endDate}`);
    whereConditions.push(eq(payments.status, 'completed'));

    const paymentsData = await db
      .select({
        paidAt: payments.paidAt,
        amount: payments.amount,
      })
      .from(payments)
      .where(and(...whereConditions))
      .orderBy(payments.paidAt);

    // Group by period
    const grouped = new Map<string, { total: number; count: number }>();
    paymentsData.forEach(p => {
      if (!p.paidAt) return;
      const period = this.formatPeriod(new Date(p.paidAt), groupBy);
      const existing = grouped.get(period) || { total: 0, count: 0 };
      existing.total += Number(p.amount);
      existing.count++;
      grouped.set(period, existing);
    });

    const data: SalesReportData[] = Array.from(grouped.entries()).map(([period, stats]) => ({
      period,
      totalRevenue: stats.total,
      totalEnrollments: stats.count,
      averageOrderValue: stats.total / stats.count,
    }));

    const summary = {
      totalRevenue: data.reduce((sum, d) => sum + d.totalRevenue, 0),
      totalEnrollments: data.reduce((sum, d) => sum + d.totalEnrollments, 0),
      averageOrderValue: data.reduce((sum, d) => sum + d.averageOrderValue, 0) / (data.length || 1),
    };

    return { data, summary };
  }

  // ========== USER REPORT ==========
  async getUserReport(startDate?: string, endDate?: string, groupBy: 'day' | 'month' | 'year' = 'month'): Promise<any> {
    const whereConditions = [];
    if (startDate) whereConditions.push(sql`${users.createdAt} >= ${startDate}`);
    if (endDate) whereConditions.push(sql`${users.createdAt} <= ${endDate}`);

    const usersData = await db
      .select({
        createdAt: users.createdAt,
        role: users.role,
      })
      .from(users)
      .where(and(...whereConditions))
      .orderBy(users.createdAt);

    const grouped = new Map<string, { total: number; students: number; instructors: number }>();
    usersData.forEach(u => {
      // @ts-ignore
      const period = this.formatPeriod(new Date(u.createdAt), groupBy);
      const existing = grouped.get(period) || { total: 0, students: 0, instructors: 0 };
      existing.total++;
      if (u.role === 'student') existing.students++;
      if (u.role === 'instructor') existing.instructors++;
      grouped.set(period, existing);
    });

    const data: UserReportData[] = Array.from(grouped.entries()).map(([period, stats]) => ({
      period,
      newUsers: stats.total,
      newStudents: stats.students,
      newInstructors: stats.instructors,
    }));

    // Overall totals
    const [userTotals] = await db
      .select({
        totalUsers: count(),
        totalStudents: sql<number>`sum(case when ${users.role} = 'student' then 1 else 0 end)`,
        totalInstructors: sql<number>`sum(case when ${users.role} = 'instructor' then 1 else 0 end)`,
      })
      .from(users);

    return {
      data,
      summary: {
        totalUsers: Number(userTotals.totalUsers),
        totalStudents: Number(userTotals.totalStudents),
        totalInstructors: Number(userTotals.totalInstructors),
      },
    };
  }

  // ========== COURSE REPORT ==========
  async getCourseReport(): Promise<CourseReportData[]> {
    const coursesWithStats = await db
      .select({
        courseId: courses.id,
        title: courses.title,
        enrollments: sql<number>`count(distinct ${enrollments.id})`,
        completed: sql<number>`sum(case when ${enrollments.status} = 'completed' then 1 else 0 end)`,
        revenue: sql<number>`coalesce(sum(${payments.amount}), 0)`,
        averageRating: sql<number>`coalesce(avg(${courseReviews.rating}), 0)`,
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(invoices, eq(enrollments.id, invoices.enrollmentId))
      .leftJoin(payments, eq(invoices.id, payments.invoiceId))
      .leftJoin(courseReviews, and(eq(courseReviews.courseId, courses.id), eq(courseReviews.userId, enrollments.userId)))
      .groupBy(courses.id)
      .orderBy(sql`revenue DESC`);

    return coursesWithStats.map(c => ({
      courseId: c.courseId,
      title: c.title,
      enrollments: Number(c.enrollments),
      completed: Number(c.completed),
      revenue: Number(c.revenue),
      averageRating: Number(c.averageRating),
    }));
  }

  // ========== ENROLLMENT TREND REPORT ==========
  async getEnrollmentReport(startDate?: string, endDate?: string, groupBy: 'day' | 'month' | 'year' = 'month'): Promise<any> {
    const whereConditions = [];
    if (startDate) whereConditions.push(sql`${enrollments.enrolledAt} >= ${startDate}`);
    if (endDate) whereConditions.push(sql`${enrollments.enrolledAt} <= ${endDate}`);

    const enrollmentsData = await db
      .select({
        enrolledAt: enrollments.enrolledAt,
        status: enrollments.status,
      })
      .from(enrollments)
      .where(and(...whereConditions))
      .orderBy(enrollments.enrolledAt);

    const grouped = new Map<string, { active: number; completed: number; refunded: number }>();
    enrollmentsData.forEach(e => {
      const period = this.formatPeriod(new Date(e.enrolledAt), groupBy);
      const existing = grouped.get(period) || { active: 0, completed: 0, refunded: 0 };
      if (e.status === 'active') existing.active++;
      if (e.status === 'completed') existing.completed++;
      if (e.status === 'refunded') existing.refunded++;
      grouped.set(period, existing);
    });

    const data: EnrollmentReportData[] = Array.from(grouped.entries()).map(([period, stats]) => ({
      period,
      active: stats.active,
      completed: stats.completed,
      refunded: stats.refunded,
    }));

    return { data };
  }

  // ========== PAYMENT REPORT ==========
  async getPaymentReport(startDate?: string, endDate?: string, groupBy: 'day' | 'month' | 'year' = 'month'): Promise<any> {
    const whereConditions = [eq(payments.status, 'completed')];
    if (startDate) whereConditions.push(sql`${payments.paidAt} >= ${startDate}`);
    if (endDate) whereConditions.push(sql`${payments.paidAt} <= ${endDate}`);

    const paymentsData = await db
      .select({
        paidAt: payments.paidAt,
        amount: payments.amount,
      })
      .from(payments)
      .where(and(...whereConditions))
      .orderBy(payments.paidAt);

    const grouped = new Map<string, { totalAmount: number; count: number }>();
    paymentsData.forEach(p => {
      if (!p.paidAt) return;
      const period = this.formatPeriod(new Date(p.paidAt), groupBy);
      const existing = grouped.get(period) || { totalAmount: 0, count: 0 };
      existing.totalAmount += Number(p.amount);
      existing.count++;
      grouped.set(period, existing);
    });

    const data: PaymentReportData[] = Array.from(grouped.entries()).map(([period, stats]) => ({
      period,
      totalAmount: stats.totalAmount,
      count: stats.count,
    }));

    const totalAmount = data.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalCount = data.reduce((sum, d) => sum + d.count, 0);

    return {
      data,
      summary: { totalAmount, totalCount, averagePayment: totalCount ? totalAmount / totalCount : 0 },
    };
  }

  // ========== PAYMENT METHODS REPORT ==========
  async getPaymentMethodReport(startDate?: string, endDate?: string): Promise<PaymentMethodReport[]> {
    const whereConditions = [eq(payments.status, 'completed')];
    if (startDate) whereConditions.push(sql`${payments.paidAt} >= ${startDate}`);
    if (endDate) whereConditions.push(sql`${payments.paidAt} <= ${endDate}`);

    const results = await db
      .select({
        method: payments.paymentMethod,
        totalAmount: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .where(and(...whereConditions))
      .groupBy(payments.paymentMethod);

    return results.map(r => ({
      method: r.method,
      totalAmount: Number(r.totalAmount) || 0,
      count: Number(r.count) || 0,
    }));
  }

  // ========== INSTRUCTOR EARNINGS REPORT ==========
  async getInstructorEarningsReport(): Promise<InstructorEarningsData[]> {
    // Get instructors
    const instructors = await db.select().from(users).where(eq(users.role, 'instructor'));

    const results: InstructorEarningsData[] = [];

    for (const instructor of instructors) {
      // Calculate total earned from completed payments for courses they teach
      const [earnedResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
        .innerJoin(enrollments, eq(invoices.enrollmentId, enrollments.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(and(eq(courses.instructorId, instructor.id), eq(payments.status, 'completed')));

      // Calculate pending payouts (sum of payouts with status pending)
      const [pendingResult] = await db
        .select({ total: sum(payouts.amount) })
        .from(payouts)
        .where(and(eq(payouts.instructorId, instructor.id), eq(payouts.status, 'pending')));

      // Calculate paid out (sum of payouts with status paid)
      const [paidResult] = await db
        .select({ total: sum(payouts.amount) })
        .from(payouts)
        .where(and(eq(payouts.instructorId, instructor.id), eq(payouts.status, 'paid')));

      results.push({
        instructorId: instructor.id,
        name: instructor.fullName,
        totalEarned: Number(earnedResult.total) || 0,
        pendingPayout: Number(pendingResult.total) || 0,
        paidOut: Number(paidResult.total) || 0,
      });
    }

    return results;
  }
}

export const reportService = new ReportService();