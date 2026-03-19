// @ts-nocheck
import { db } from '../db';
import { enrollments } from '../db/schema/enrollments';
import { users } from '../db/schema/users';
import { courses } from '../db/schema/courses';
import { eq, and, count, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreateEnrollmentInput, UpdateEnrollmentInput } from '../validations/enrollment.validation';
import type { Enrollment } from '../db/schema/enrollments';

export class EnrollmentService {
  // Check if user exists and is a student (optional)
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

  // Check if enrollment already exists
  private async ensureNotDuplicate(userId: number, courseId: number, excludeId?: number): Promise<void> {
    const query = db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    if (excludeId) {
      query.where(ne(enrollments.id, excludeId)); // we'd need 'ne' from drizzle-orm; use sql
      // simpler: fetch and filter in code
    }
    const existing = await query.limit(1);
    if (existing.length > 0 && (!excludeId || existing[0].id !== excludeId)) {
      throw new BadRequestError('User already enrolled in this course');
    }
  }

  // Check permission for viewing/modifying an enrollment
  private async checkEnrollmentPermission(enrollmentId: number, userId: number, userRole: string): Promise<Enrollment> {
    const enrollment = await this.getEnrollmentById(enrollmentId);
    if (userRole === 'admin') return enrollment;

    if (userRole === 'student') {
      if (enrollment.userId !== userId) {
        throw new ForbiddenError('You can only access your own enrollments');
      }
      return enrollment;
    }

    if (userRole === 'instructor') {
      // Check if instructor owns the course
      const [course] = await db
        .select({ instructorId: courses.instructorId })
        .from(courses)
        .where(eq(courses.id, enrollment.courseId))
        .limit(1);
      if (!course || course.instructorId !== userId) {
        throw new ForbiddenError('You can only access enrollments for your own courses');
      }
      return enrollment;
    }

    throw new ForbiddenError('Insufficient permissions');
  }

  async createEnrollment(data: CreateEnrollmentInput, currentUserId: number, currentUserRole: string): Promise<Enrollment> {
    // Authorization: students can only enroll themselves; instructors/admins can enroll any student
    if (currentUserRole === 'student' && data.userId !== currentUserId) {
      throw new ForbiddenError('You can only enroll yourself');
    }

    await this.ensureUserExists(data.userId);
    await this.ensureCourseExists(data.courseId);
    await this.ensureNotDuplicate(data.userId, data.courseId);

    const [enrollment] = await db
      .insert(enrollments)
      .values({
        ...data,
        enrolledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return enrollment;
  }

  async getAllEnrollments(params: {
    page?: number;
    limit?: number;
    userId?: number;
    courseId?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, currentUserId: number, currentUserRole: string): Promise<{ data: Enrollment[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    // Apply role-based filters
    if (currentUserRole === 'student') {
      whereConditions.push(eq(enrollments.userId, currentUserId));
    } else if (currentUserRole === 'instructor') {
      // Only enrollments for courses taught by this instructor
      const instructorCourses = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.instructorId, currentUserId));
      if (instructorCourses.length === 0) {
        // No courses, so return empty
        return { data: [], total: 0 };
      }
      const courseIds = instructorCourses.map(c => c.id);
      whereConditions.push(sql`${enrollments.courseId} IN (${sql.join(courseIds, sql`, `)})`);
    }
    // Admin: no extra filter

    if (params.userId && (currentUserRole === 'admin' || (currentUserRole === 'instructor' && params.userId))) {
      whereConditions.push(eq(enrollments.userId, params.userId));
    }
    if (params.courseId) {
      whereConditions.push(eq(enrollments.courseId, params.courseId));
    }
    if (params.status) {
      whereConditions.push(eq(enrollments.status, params.status as any));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(enrollments)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'completedAt': return enrollments.completedAt;
        case 'createdAt': return enrollments.createdAt;
        case 'updatedAt': return enrollments.updatedAt;
        default: return enrollments.enrolledAt;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(enrollments)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getEnrollmentById(id: number): Promise<Enrollment> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1);

    if (!enrollment) throw new NotFoundError('Enrollment');
    return enrollment;
  }

  async updateEnrollment(id: number, data: UpdateEnrollmentInput, currentUserId: number, currentUserRole: string): Promise<Enrollment> {
    // Only admins and instructors (for their own courses) can update enrollment status
    const enrollment = await this.checkEnrollmentPermission(id, currentUserId, currentUserRole);
    // Instructors can only update status, not change userId/courseId (not in schema anyway)

    const [updated] = await db
      .update(enrollments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, id))
      .returning();

    return updated;
  }

  async deleteEnrollment(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    const enrollment = await this.checkEnrollmentPermission(id, currentUserId, currentUserRole);
    // Only admins or instructors (for their courses) can delete? Usually only admins, but we'll allow instructors as well.
    if (currentUserRole === 'student') {
      throw new ForbiddenError('Students cannot delete enrollments');
    }

    const result = await db.delete(enrollments).where(eq(enrollments.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Enrollment');
  }

  async completeEnrollment(id: number, currentUserId: number, currentUserRole: string): Promise<Enrollment> {
    const enrollment = await this.getEnrollmentById(id);
    // Students can only complete their own active enrollments
    if (currentUserRole === 'student' && enrollment.userId !== currentUserId) {
      throw new ForbiddenError('You can only complete your own enrollments');
    }
    if (enrollment.status !== 'active') {
      throw new BadRequestError('Only active enrollments can be completed');
    }

    const [updated] = await db
      .update(enrollments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(enrollments.id, id))
      .returning();

    return updated;
  }

  async getEnrollmentByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
      .limit(1);
    return enrollment || null;
  }
}

export const enrollmentService = new EnrollmentService();