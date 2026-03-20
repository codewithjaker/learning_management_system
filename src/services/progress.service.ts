import { db } from '../db';
import { users } from '../db/schema/users';
import { syllabusItems } from '../db/schema/syllabusItems';
import { syllabusSections } from '../db/schema/syllabusSections';
import { courses } from '../db/schema/courses';
import { enrollments } from '../db/schema/enrollments';
import { userItemProgress } from '../db/schema/progress';
import { eq, and, count, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { UpsertProgressInput, UpdateProgressInput } from '../validations/progress.validation';
import type { UserItemProgress } from '../db/schema/progress';

export class ProgressService {
  // Check if user exists
  private async ensureUserExists(userId: number): Promise<void> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new BadRequestError('User not found');
  }

  // Check if item exists and get its courseId
  private async ensureItemExists(itemId: number): Promise<{ courseId: number }> {
    const [item] = await db
      .select({
        courseId: syllabusSections.courseId,
      })
      .from(syllabusItems)
      .innerJoin(syllabusSections, eq(syllabusItems.sectionId, syllabusSections.id))
      .where(eq(syllabusItems.id, itemId))
      .limit(1);

    if (!item) throw new BadRequestError('Syllabus item not found');
    return item;
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
      throw new ForbiddenError('User is not enrolled in this course');
    }
  }

  // Check permission for viewing/updating a progress record
  private async checkProgressPermission(
    progressId: number,
    currentUserId: number,
    currentUserRole: string
  ): Promise<UserItemProgress> {
    const progress = await this.getProgressById(progressId);
    if (currentUserRole === 'admin') return progress;

    if (currentUserRole === 'student') {
      if (progress.userId !== currentUserId) {
        throw new ForbiddenError('You can only access your own progress');
      }
      return progress;
    }

    if (currentUserRole === 'instructor') {
      // Get courseId from item
      const { courseId } = await this.ensureItemExists(progress.itemId);
      // Check if instructor owns the course
      const [course] = await db
        .select({ instructorId: courses.instructorId })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);
      if (!course || course.instructorId !== currentUserId) {
        throw new ForbiddenError('You can only view progress for your own courses');
      }
      return progress;
    }

    throw new ForbiddenError('Insufficient permissions');
  }

  // Upsert progress: create if not exists, update if exists
  async upsertProgress(data: UpsertProgressInput, currentUserId: number, currentUserRole: string): Promise<UserItemProgress> {
    // Authorization: students can only upsert their own progress
    if (currentUserRole === 'student' && data.userId !== currentUserId) {
      throw new ForbiddenError('You can only update your own progress');
    }

    await this.ensureUserExists(data.userId);
    const { courseId } = await this.ensureItemExists(data.itemId);
    await this.ensureUserEnrolled(data.userId, courseId);

    // Check if progress record already exists
    const existing = await db
      .select()
      .from(userItemProgress)
      .where(and(
        eq(userItemProgress.userId, data.userId),
        eq(userItemProgress.itemId, data.itemId)
      ))
      .limit(1);

    const completedAt = data.completed ? new Date() : undefined;

    if (existing.length > 0) {
      // Update existing
      const [updated] = await db
        .update(userItemProgress)
        .set({
          completed: data.completed ?? existing[0].completed,
          lastPosition: data.lastPosition ?? existing[0].lastPosition,
          completedAt: data.completed ? new Date() : existing[0].completedAt,
          updatedAt: new Date(),
        })
        .where(eq(userItemProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new
      const [progress] = await db
        .insert(userItemProgress)
        .values({
          userId: data.userId,
          itemId: data.itemId,
          completed: data.completed ?? false,
          lastPosition: data.lastPosition,
          completedAt: data.completed ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return progress;
    }
  }

  async getProgressById(id: number): Promise<UserItemProgress> {
    const [progress] = await db
      .select()
      .from(userItemProgress)
      .where(eq(userItemProgress.id, id))
      .limit(1);

    if (!progress) throw new NotFoundError('Progress record');
    return progress;
  }

  async getProgressByUserAndCourse(
    userId: number,
    courseId: number,
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    currentUserId: number,
    currentUserRole: string
  ): Promise<{ data: (UserItemProgress & { itemTitle: string; itemType: string })[]; total: number }> {
    // Authorization
    if (currentUserRole === 'student' && userId !== currentUserId) {
      throw new ForbiddenError('You can only view your own progress');
    }
    if (currentUserRole === 'instructor') {
      // Check if instructor owns the course
      const [course] = await db
        .select({ instructorId: courses.instructorId })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);
      if (!course || course.instructorId !== currentUserId) {
        throw new ForbiddenError('You can only view progress for your own courses');
      }
    }

    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    // Build subquery to get items belonging to this course
    const courseItems = db
      .select({ id: syllabusItems.id })
      .from(syllabusItems)
      .innerJoin(syllabusSections, eq(syllabusItems.sectionId, syllabusSections.id))
      .where(eq(syllabusSections.courseId, courseId))
      .as('courseItems');

    const totalResult = await db
      .select({ count: count() })
      .from(userItemProgress)
      .innerJoin(courseItems, eq(userItemProgress.itemId, courseItems.id))
      .where(eq(userItemProgress.userId, userId));
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = params.sortBy === 'itemId' ? userItemProgress.itemId : userItemProgress.updatedAt;
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select({
        id: userItemProgress.id,
        userId: userItemProgress.userId,
        itemId: userItemProgress.itemId,
        completed: userItemProgress.completed,
        lastPosition: userItemProgress.lastPosition,
        completedAt: userItemProgress.completedAt,
        createdAt: userItemProgress.createdAt,
        updatedAt: userItemProgress.updatedAt,
        itemTitle: syllabusItems.title,
        itemType: syllabusItems.type,
      })
      .from(userItemProgress)
      .innerJoin(syllabusItems, eq(userItemProgress.itemId, syllabusItems.id))
      .innerJoin(courseItems, eq(userItemProgress.itemId, courseItems.id))
      .where(eq(userItemProgress.userId, userId))
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getProgressByItem(
    itemId: number,
    params: { page?: number; limit?: number }
  ): Promise<{ data: UserItemProgress[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: count() })
      .from(userItemProgress)
      .where(eq(userItemProgress.itemId, itemId));
    const total = Number(totalResult[0]?.count) || 0;

    const data = await db
      .select()
      .from(userItemProgress)
      .where(eq(userItemProgress.itemId, itemId))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async updateProgress(id: number, data: UpdateProgressInput, currentUserId: number, currentUserRole: string): Promise<UserItemProgress> {
    const progress = await this.checkProgressPermission(id, currentUserId, currentUserRole);

    const completedAt = data.completed ? new Date() : (data.completed === false ? null : progress.completedAt);

    const [updated] = await db
      .update(userItemProgress)
      .set({
        completed: data.completed ?? progress.completed,
        lastPosition: data.lastPosition ?? progress.lastPosition,
        completedAt,
        updatedAt: new Date(),
      })
      .where(eq(userItemProgress.id, id))
      .returning();

    return updated;
  }

  async deleteProgress(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    const progress = await this.checkProgressPermission(id, currentUserId, currentUserRole);
    // Only admins or the owning instructor (for their course) can delete. We'll allow admins only for safety.
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can delete progress records');
    }

    const result = await db.delete(userItemProgress).where(eq(userItemProgress.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Progress record');
  }

  async getOverallProgress(userId: number, courseId: number, currentUserId: number, currentUserRole: string): Promise<{ completed: number; total: number }> {
    // Authorization same as getProgressByUserAndCourse
    if (currentUserRole === 'student' && userId !== currentUserId) {
      throw new ForbiddenError('You can only view your own progress');
    }
    if (currentUserRole === 'instructor') {
      const [course] = await db
        .select({ instructorId: courses.instructorId })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1);
      if (!course || course.instructorId !== currentUserId) {
        throw new ForbiddenError('You can only view progress for your own courses');
      }
    }

    // Total items in course
    const totalResult = await db
      .select({ count: count() })
      .from(syllabusItems)
      .innerJoin(syllabusSections, eq(syllabusItems.sectionId, syllabusSections.id))
      .where(eq(syllabusSections.courseId, courseId));
    const total = Number(totalResult[0]?.count) || 0;

    if (total === 0) return { completed: 0, total: 0 };

    // Completed items by user
    const completedResult = await db
      .select({ count: count() })
      .from(userItemProgress)
      .innerJoin(syllabusItems, eq(userItemProgress.itemId, syllabusItems.id))
      .innerJoin(syllabusSections, eq(syllabusItems.sectionId, syllabusSections.id))
      .where(and(
        eq(userItemProgress.userId, userId),
        eq(syllabusSections.courseId, courseId),
        eq(userItemProgress.completed, true)
      ));
    const completed = Number(completedResult[0]?.count) || 0;

    return { completed, total };
  }
}

export const progressService = new ProgressService();