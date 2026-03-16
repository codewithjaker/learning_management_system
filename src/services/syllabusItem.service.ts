//@ts-nocheck
import { db } from '../db';
import { syllabusItems } from '../db/schema/syllabusItems';
import { syllabusSections } from '../db/schema/syllabusSections';
import { courses } from '../db/schema/courses';
import { eq, and, count, asc, desc } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreateItemInput, UpdateItemInput } from '../validations/syllabusItem';
import type { SyllabusItem } from '../db/schema/syllabusItems';

export class SyllabusItemService {
  // Check if user has permission to modify items of a given section (via its course)
  private async checkSectionPermission(sectionId: number, userId: number, userRole: string): Promise<{ courseId: number }> {
    if (userRole === 'admin') {
      // still need to verify section exists
      const [section] = await db
        .select({ courseId: syllabusSections.courseId })
        .from(syllabusSections)
        .where(eq(syllabusSections.id, sectionId))
        .limit(1);
      if (!section) throw new NotFoundError('Section');
      return section;
    }

    const [section] = await db
      .select({
        courseId: syllabusSections.courseId,
        instructorId: courses.instructorId,
      })
      .from(syllabusSections)
      .innerJoin(courses, eq(syllabusSections.courseId, courses.id))
      .where(eq(syllabusSections.id, sectionId))
      .limit(1);

    if (!section) throw new NotFoundError('Section');
    if (section.instructorId !== userId) {
      throw new ForbiddenError('You can only modify items of your own courses');
    }
    return { courseId: section.courseId };
  }

  async createItem(data: CreateItemInput, userId: number, userRole: string): Promise<SyllabusItem> {
    await this.checkSectionPermission(data.sectionId, userId, userRole);

    const [item] = await db
      .insert(syllabusItems)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return item;
  }

  async getItemsBySection(sectionId: number, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: SyllabusItem[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: count() })
      .from(syllabusItems)
      .where(eq(syllabusItems.sectionId, sectionId));
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'title': return syllabusItems.title;
        case 'type': return syllabusItems.type;
        case 'createdAt': return syllabusItems.createdAt;
        default: return syllabusItems.orderIndex;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(syllabusItems)
      .where(eq(syllabusItems.sectionId, sectionId))
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getItemById(id: number): Promise<SyllabusItem> {
    const [item] = await db
      .select()
      .from(syllabusItems)
      .where(eq(syllabusItems.id, id))
      .limit(1);

    if (!item) throw new NotFoundError('Item');
    return item;
  }

  async updateItem(id: number, data: UpdateItemInput, userId: number, userRole: string): Promise<SyllabusItem> {
    const item = await this.getItemById(id);
    await this.checkSectionPermission(item.sectionId, userId, userRole);

    const [updated] = await db
      .update(syllabusItems)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(syllabusItems.id, id))
      .returning();

    return updated;
  }

  async deleteItem(id: number, userId: number, userRole: string): Promise<void> {
    const item = await this.getItemById(id);
    await this.checkSectionPermission(item.sectionId, userId, userRole);

    const result = await db.delete(syllabusItems).where(eq(syllabusItems.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Item');
  }
}

export const syllabusItemService = new SyllabusItemService();