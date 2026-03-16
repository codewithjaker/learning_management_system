import { db } from '../db';
import { syllabusSections } from '../db/schema/syllabusSections';
import { courses } from '../db/schema/courses';
import { eq, and, asc, count, desc, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreateSectionInput, UpdateSectionInput } from '../validations/syllabusSection';
import type { SyllabusSection } from '../db/schema/syllabusSections';

export class SyllabusSectionService {
  // Check if user has permission to modify sections of a given course
  private async checkCoursePermission(courseId: number, userId: number, userRole: string): Promise<void> {
    if (userRole === 'admin') return;
    const [course] = await db
      .select({ instructorId: courses.instructorId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    if (!course) throw new NotFoundError('Course');
    if (course.instructorId !== userId) {
      throw new ForbiddenError('You can only modify sections of your own courses');
    }
  }

  async createSection(data: CreateSectionInput, userId: number, userRole: string): Promise<SyllabusSection> {
    await this.checkCoursePermission(data.courseId, userId, userRole);

    const [section] = await db
      .insert(syllabusSections)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return section;
  }

  async getSectionsByCourse(courseId: number, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: SyllabusSection[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: count() })
      .from(syllabusSections)
      .where(eq(syllabusSections.courseId, courseId));
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = params.sortBy === 'title' ? syllabusSections.title : syllabusSections.orderIndex;
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(syllabusSections)
      .where(eq(syllabusSections.courseId, courseId))
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getSectionById(id: number): Promise<SyllabusSection> {
    const [section] = await db
      .select()
      .from(syllabusSections)
      .where(eq(syllabusSections.id, id))
      .limit(1);

    if (!section) throw new NotFoundError('Section');
    return section;
  }

  async updateSection(id: number, data: UpdateSectionInput, userId: number, userRole: string): Promise<SyllabusSection> {
    const section = await this.getSectionById(id);
    await this.checkCoursePermission(section.courseId, userId, userRole);

    const [updated] = await db
      .update(syllabusSections)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(syllabusSections.id, id))
      .returning();

    return updated;
  }

  async deleteSection(id: number, userId: number, userRole: string): Promise<void> {
    const section = await this.getSectionById(id);
    await this.checkCoursePermission(section.courseId, userId, userRole);

    const result = await db.delete(syllabusSections).where(eq(syllabusSections.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Section');
  }
}

export const syllabusSectionService = new SyllabusSectionService();