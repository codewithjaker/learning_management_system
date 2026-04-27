// @ts-nocheck

import { db } from '../db';
import { courseReviews } from '../db/schema/reviews';
import { users } from '../db/schema/users';
import { courses } from '../db/schema/courses';
import { enrollments } from '../db/schema/enrollments';
import { eq, and, count, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { courseService } from './course.service'; // for updating stats
import type { CreateReviewInput, UpdateReviewInput } from '../validations/review.validation';
import type { CourseReview } from '../db/schema/reviews';

export class ReviewService {
  // Check if user exists
  private async ensureUserExists(userId: number): Promise<void> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new BadRequestError('User not found');
  }

  // Check if course exists
  private async ensureCourseExists(courseId: number): Promise<void> {
    const [course] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new BadRequestError('Course not found');
  }

  // Check if user is enrolled in the course
  private async ensureUserEnrolled(userId: number, courseId: number): Promise<void> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, 'active')
      ))
      .limit(1);
    if (!enrollment) {
      throw new ForbiddenError('You must be enrolled in the course to review it');
    }
  }

  // Check if user already reviewed this course (for create)
  private async ensureNoDuplicate(userId: number, courseId: number): Promise<void> {
    const existing = await db
      .select()
      .from(courseReviews)
      .where(and(eq(courseReviews.userId, userId), eq(courseReviews.courseId, courseId)))
      .limit(1);
    if (existing.length > 0) {
      throw new BadRequestError('You have already reviewed this course');
    }
  }

  // Check permission for a review record (for update/delete/get)
  private async checkReviewPermission(
    reviewId: number,
    currentUserId: number,
    currentUserRole: string
  ): Promise<CourseReview> {
    const review = await this.getReviewById(reviewId);
    if (currentUserRole === 'admin') return review;

    if (currentUserRole === 'student') {
      if (review.userId !== currentUserId) {
        throw new ForbiddenError('You can only modify your own reviews');
      }
      return review;
    }

    if (currentUserRole === 'instructor') {
      // Check if instructor owns the course
      const [course] = await db
        .select({ instructorId: courses.instructorId })
        .from(courses)
        .where(eq(courses.id, review.courseId))
        .limit(1);
      if (!course || course.instructorId !== currentUserId) {
        throw new ForbiddenError('You can only view reviews for your own courses');
      }
      return review;
    }

    throw new ForbiddenError('Insufficient permissions');
  }

  // Update course average rating and total reviews
  private async updateCourseStats(courseId: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`avg(${courseReviews.rating})`,
        totalReviews: count(),
      })
      .from(courseReviews)
      .where(eq(courseReviews.courseId, courseId));

    const avgRating = result[0]?.avgRating ? Number(result[0].avgRating).toFixed(1) : '0.0';
    const totalReviews = Number(result[0]?.totalReviews) || 0;

    await courseService.updateCourseStats(courseId, {
      rating: parseFloat(avgRating),
      totalReviews,
    });
  }

  async createReview(data: CreateReviewInput, currentUserId: number, currentUserRole: string): Promise<CourseReview> {
    // Authorization: students can only create their own reviews
    if (currentUserRole === 'student' && data.userId !== currentUserId) {
      throw new ForbiddenError('You can only create reviews for yourself');
    }

    await this.ensureUserExists(data.userId);
    await this.ensureCourseExists(data.courseId);
    await this.ensureUserEnrolled(data.userId, data.courseId);
    await this.ensureNoDuplicate(data.userId, data.courseId);

    const [review] = await db
      .insert(courseReviews)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update course stats
    await this.updateCourseStats(data.courseId);

    return review;
  }

  async getReviews(params: {
    page?: number;
    limit?: number;
    courseId?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (params.courseId) conditions.push(eq(courseReviews.courseId, params.courseId));
    if (params.rating) conditions.push(eq(courseReviews.rating, params.rating));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(courseReviews)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    // Determine sort column and order
    const sortColumn = params.sortBy === 'createdAt' ? courseReviews.createdAt : courseReviews.rating;
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    // Fetch data with joins to user and course
    const data = await db
      .select({
        id: courseReviews.id,
        userId: courseReviews.userId,
        courseId: courseReviews.courseId,
        rating: courseReviews.rating,
        comment: courseReviews.comment,
        createdAt: courseReviews.createdAt,
        updatedAt: courseReviews.updatedAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          avatar: users.avatar,
        },
        course: {
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
        },
      })
      .from(courseReviews)
      .innerJoin(users, eq(courseReviews.userId, users.id))
      .innerJoin(courses, eq(courseReviews.courseId, courses.id))
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getReviewById(id: number): Promise<CourseReview> {
    const [review] = await db
      .select()
      .from(courseReviews)
      .where(eq(courseReviews.id, id))
      .limit(1);

    if (!review) throw new NotFoundError('Review');
    return review;
  }

  async getReviewsByCourse(
    courseId: number,
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ data: (CourseReview & { userFullName: string })[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: count() })
      .from(courseReviews)
      .where(eq(courseReviews.courseId, courseId));
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = params.sortBy === 'rating' ? courseReviews.rating : courseReviews.createdAt;
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select({
        id: courseReviews.id,
        userId: courseReviews.userId,
        courseId: courseReviews.courseId,
        rating: courseReviews.rating,
        comment: courseReviews.comment,
        createdAt: courseReviews.createdAt,
        updatedAt: courseReviews.updatedAt,
        userFullName: users.fullName,
      })
      .from(courseReviews)
      .innerJoin(users, eq(courseReviews.userId, users.id))
      .where(eq(courseReviews.courseId, courseId))
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getReviewsByUser(
    userId: number,
    params: { page?: number; limit?: number }
  ): Promise<{ data: CourseReview[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: count() })
      .from(courseReviews)
      .where(eq(courseReviews.userId, userId));
    const total = Number(totalResult[0]?.count) || 0;

    const data = await db
      .select()
      .from(courseReviews)
      .where(eq(courseReviews.userId, userId))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getUserReview(userId: number, courseId: number): Promise<CourseReview | null> {
    const [review] = await db
      .select()
      .from(courseReviews)
      .where(and(eq(courseReviews.userId, userId), eq(courseReviews.courseId, courseId)))
      .limit(1);
    return review || null;
  }

  async updateReview(
    id: number,
    data: UpdateReviewInput,
    currentUserId: number,
    currentUserRole: string
  ): Promise<CourseReview> {
    const review = await this.checkReviewPermission(id, currentUserId, currentUserRole);

    const [updated] = await db
      .update(courseReviews)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(courseReviews.id, id))
      .returning();

    // Update course stats
    await this.updateCourseStats(review.courseId);

    return updated;
  }

  async deleteReview(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    const review = await this.checkReviewPermission(id, currentUserId, currentUserRole);

    const result = await db.delete(courseReviews).where(eq(courseReviews.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Review');

    // Update course stats
    await this.updateCourseStats(review.courseId);
  }
}

export const reviewService = new ReviewService();