import { db } from '../db';
import { categories } from '../db/schema/categories';
import { eq, like, desc, asc, count, and, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError } from '../utils/errors';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validations/category.validation';
import type { Category } from '../db/schema/categories';

export class CategoryService {
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    // Check uniqueness of name and slug
    const existing = await db
      .select()
      .from(categories)
      .where(sql`${categories.name} = ${data.name} OR ${categories.slug} = ${data.slug}`)
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].name === data.name) {
        throw new BadRequestError('Category name already exists');
      } else {
        throw new BadRequestError('Category slug already exists');
      }
    }
    

    const [category] = await db
      .insert(categories)
      .values(data)
      .returning();

    return category;
  }

  async getAllCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Category[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (params.search) {
      whereConditions.push(like(categories.name, `%${params.search}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(categories)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = params.sortBy === 'name' ? categories.name : categories.createdAt;
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getCategoryById(id: number): Promise<Category> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async updateCategory(id: number, data: UpdateCategoryInput): Promise<Category> {
    // If name or slug is being updated, check uniqueness
    if (data.name || data.slug) {
      const conditions = [];
      if (data.name) conditions.push(sql`${categories.name} = ${data.name}`);
      if (data.slug) conditions.push(sql`${categories.slug} = ${data.slug}`);
      
      const existing = await db
        .select()
        .from(categories)
        .where(and(sql`(${sql.join(conditions, sql` OR `)})`, sql`${categories.id} != ${id}`))
        .limit(1);

      if (existing.length > 0) {
        if (data.name && existing[0].name === data.name) {
          throw new BadRequestError('Category name already exists');
        } else {
          throw new BadRequestError('Category slug already exists');
        }
      }
    }

    const [updated] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) throw new NotFoundError('Category');
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Category');
  }

  async categoryExists(id: number): Promise<boolean> {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return !!cat;
  }
}

export const categoryService = new CategoryService();