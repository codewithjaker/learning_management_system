// @ts-nocheck
import { db } from '../db';
import { courses } from '../db/schema/courses';
import { users } from '../db/schema/users';
import { eq, like, desc, asc, count, and, sql, inArray } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreateCourseInput, UpdateCourseInput } from '../validations/course.validation';
import type { Course } from '../db/schema/courses';

export class CourseService {
  // Helper to check if instructor exists
  private async ensureInstructorExists(instructorId: number): Promise<void> {
    const [instructor] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, instructorId), eq(users.role, 'instructor')))
      .limit(1);
    if (!instructor) throw new BadRequestError('Instructor not found or not an instructor');
  }

  // Helper to check uniqueness of slug (except for current course)
  private async ensureSlugUnique(slug: string, excludeId?: number): Promise<void> {
    const query = db.select().from(courses).where(eq(courses.slug, slug));
    if (excludeId) {
      query.where(ne(courses.id, excludeId)); // we'll implement manually below
    }
    const existing = await query.limit(1);
    if (existing.length > 0) {
      throw new BadRequestError('Course slug already exists');
    }
  }

  async createCourse(data: CreateCourseInput): Promise<Course> {
    await this.ensureInstructorExists(data.instructorId);
    await this.ensureSlugUnique(data.slug);

    const [course] = await db
      .insert(courses)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return course;
  }

  async getAllCourses(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    level?: string;
    instructorId?: number;
    featured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Course[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (params.search) {
      whereConditions.push(
        sql`(${courses.title} ILIKE ${`%${params.search}%`} OR ${courses.subtitle} ILIKE ${`%${params.search}%`})`
      );
    }
    if (params.category) {
      whereConditions.push(eq(courses.category, params.category));
    }
    if (params.level) {
      whereConditions.push(eq(courses.level, params.level as any));
    }
    if (params.instructorId) {
      whereConditions.push(eq(courses.instructorId, params.instructorId));
    }
    if (params.featured !== undefined) {
      whereConditions.push(eq(courses.featured, params.featured));
    }
    if (params.isNew !== undefined) {
      whereConditions.push(eq(courses.isNew, params.isNew));
    }
    if (params.isBestseller !== undefined) {
      whereConditions.push(eq(courses.isBestseller, params.isBestseller));
    }
    if (params.status) {
      whereConditions.push(eq(courses.status, params.status as any));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(courses)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'title': return courses.title;
        case 'price': return courses.price;
        case 'rating': return courses.rating;
        default: return courses.createdAt;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(courses)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getCourseById(id: number): Promise<Course> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (!course) throw new NotFoundError('Course');
    return course;
  }

  async getCourseBySlug(slug: string): Promise<Course> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);

    if (!course) throw new NotFoundError('Course');
    return course;
  }

  async updateCourse(id: number, data: UpdateCourseInput, userId: number, userRole: string): Promise<Course> {
    // Fetch current course to check ownership
    const current = await this.getCourseById(id);

    // Authorization: only instructor of this course or admin can update
    if (userRole !== 'admin' && current.instructorId !== userId) {
      throw new ForbiddenError('You can only update your own courses');
    }

    // If slug is being updated, check uniqueness
    if (data.slug && data.slug !== current.slug) {
      await this.ensureSlugUnique(data.slug, id);
    }

    // If instructorId is being changed, verify new instructor exists
    if (data.instructorId && data.instructorId !== current.instructorId) {
      await this.ensureInstructorExists(data.instructorId);
    }

    const [updated] = await db
      .update(courses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    return updated;
  }

  async deleteCourse(id: number, userId: number, userRole: string): Promise<void> {
    const current = await this.getCourseById(id);
    if (userRole !== 'admin' && current.instructorId !== userId) {
      throw new ForbiddenError('You can only delete your own courses');
    }

    const result = await db.delete(courses).where(eq(courses.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Course');
  }

  async publishCourse(id: number, userId: number, userRole: string): Promise<Course> {
    const current = await this.getCourseById(id);
    if (userRole !== 'admin' && current.instructorId !== userId) {
      throw new ForbiddenError('You can only publish your own courses');
    }

    const [updated] = await db
      .update(courses)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    return updated;
  }

  async updateCourseStats(id: number, stats: { rating?: number; totalReviews?: number; duration?: number }): Promise<Course> {
    const [updated] = await db
      .update(courses)
      .set({
        ...stats,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    if (!updated) throw new NotFoundError('Course');
    return updated;
  }

  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    await this.ensureInstructorExists(instructorId); // optional
    return db
      .select()
      .from(courses)
      .where(eq(courses.instructorId, instructorId));
  }

  async courseExists(id: number): Promise<boolean> {
    const [course] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return !!course;
  }
}

export const courseService = new CourseService();