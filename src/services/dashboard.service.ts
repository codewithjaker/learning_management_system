import { db } from '../db';
import { users } from '../db/schema/users';
import { courses } from '../db/schema/courses';
import { enrollments } from '../db/schema/enrollments';
import { payments } from '../db/schema/payments';
import { payouts } from '../db/schema/payouts';
import { courseReviews } from '../db/schema/reviews';
import { invoices } from '../db/schema/invoices';
import { eq, and, sql, count, sum, avg, desc } from 'drizzle-orm';
import { DashboardStats, RevenueData, EnrollmentData, RecentActivity } from '../types/dashboard.types';

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    // Get user counts
    const [userStats] = await db
      .select({
        total: count(),
        students: sql<number>`sum(case when ${users.role} = 'student' then 1 else 0 end)`,
        instructors: sql<number>`sum(case when ${users.role} = 'instructor' then 1 else 0 end)`,
      })
      .from(users);

    // Get course counts
    const [courseStats] = await db
      .select({
        total: count(),
        published: sql<number>`sum(case when ${courses.status} = 'published' then 1 else 0 end)`,
      })
      .from(courses);

    // Get enrollment counts
    const [enrollmentStats] = await db
      .select({
        total: count(),
        active: sql<number>`sum(case when ${enrollments.status} = 'active' then 1 else 0 end)`,
        completed: sql<number>`sum(case when ${enrollments.status} = 'completed' then 1 else 0 end)`,
      })
      .from(enrollments);

    // Total revenue from completed payments
    const [revenueResult] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'completed'));

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [monthlyRevenueResult] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        sql`${payments.paidAt} >= ${thirtyDaysAgo.toISOString()}`
      ));

    // Pending payouts (sum of payouts with status 'pending')
    const [pendingPayoutsResult] = await db
      .select({ total: sum(payouts.amount) })
      .from(payouts)
      .where(eq(payouts.status, 'pending'));

    // Review stats
    const [reviewStats] = await db
      .select({
        total: count(),
        avgRating: avg(courseReviews.rating),
      })
      .from(courseReviews);

    return {
      totalUsers: Number(userStats.total),
      totalStudents: Number(userStats.students),
      totalInstructors: Number(userStats.instructors),
      totalCourses: Number(courseStats.total),
      publishedCourses: Number(courseStats.published),
      totalEnrollments: Number(enrollmentStats.total),
      activeEnrollments: Number(enrollmentStats.active),
      completedEnrollments: Number(enrollmentStats.completed),
      totalRevenue: Number(revenueResult.total) || 0,
      monthlyRevenue: Number(monthlyRevenueResult.total) || 0,
      pendingPayouts: Number(pendingPayoutsResult.total) || 0,
      totalReviews: Number(reviewStats.total),
      averageRating: Number(reviewStats.avgRating) || 0,
    };
  }

  async getRevenueData(months = 6): Promise<RevenueData[]> {
    const result: RevenueData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlyTotal = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(and(
          eq(payments.status, 'completed'),
          sql`${payments.paidAt} >= ${month.toISOString()}`,
          sql`${payments.paidAt} < ${nextMonth.toISOString()}`
        ));

      result.push({
        month: monthName,
        revenue: Number(monthlyTotal[0]?.total) || 0,
      });
    }
    return result;
  }

  async getEnrollmentData(months = 6): Promise<EnrollmentData[]> {
    const result: EnrollmentData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlyCount = await db
        .select({ count: count() })
        .from(enrollments)
        .where(and(
          sql`${enrollments.enrolledAt} >= ${month.toISOString()}`,
          sql`${enrollments.enrolledAt} < ${nextMonth.toISOString()}`
        ));

      result.push({
        month: monthName,
        count: Number(monthlyCount[0]?.count) || 0,
      });
    }
    return result;
  }

  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    // Get recent enrollments with user and course info
    const recentEnrollments = await db
      .select({
        id: enrollments.id,
        type: sql<string>`'enrollment'`,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        timestamp: enrollments.enrolledAt,
        userFullName: users.fullName,
        courseTitle: courses.title,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(5);

    // Get recent payments with user info via invoices
    const recentPayments = await db
      .select({
        id: payments.id,
        type: sql<string>`'payment'`,
        amount: payments.amount,
        timestamp: payments.paidAt,
        userFullName: users.fullName,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(users, eq(invoices.userId, users.id))
      .where(eq(payments.status, 'completed'))
      .orderBy(desc(payments.paidAt))
      .limit(5);

    // Get recent reviews with user and course info
    const recentReviews = await db
      .select({
        id: courseReviews.id,
        type: sql<string>`'review'`,
        rating: courseReviews.rating,
        timestamp: courseReviews.createdAt,
        userFullName: users.fullName,
        courseTitle: courses.title,
      })
      .from(courseReviews)
      .innerJoin(users, eq(courseReviews.userId, users.id))
      .innerJoin(courses, eq(courseReviews.courseId, courses.id))
      .orderBy(desc(courseReviews.createdAt))
      .limit(5);

    const activities: RecentActivity[] = [];

    recentEnrollments.forEach(e => {
      activities.push({
        id: `enrollment-${e.id}`,
        type: 'enrollment',
        user: e.userFullName,
        course: e.courseTitle,
        timestamp: e.timestamp.toISOString(),
        description: `enrolled in "${e.courseTitle}"`,
      });
    });

    recentPayments.forEach(p => {
      activities.push({
        id: `payment-${p.id}`,
        type: 'payment',
        user: p.userFullName,
        amount: Number(p.amount),
        timestamp: p.timestamp!.toISOString(),
        description: `made a payment of $${Number(p.amount).toFixed(2)}`,
      });
    });

    recentReviews.forEach(r => {
      activities.push({
        id: `review-${r.id}`,
        type: 'review',
        user: r.userFullName,
        course: r.courseTitle,
        // @ts-ignore
        timestamp: r.timestamp.toISOString(),
        description: `left a ${r.rating}-star review for "${r.courseTitle}"`,
      });
    });

    // Sort by timestamp desc and take limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const dashboardService = new DashboardService();