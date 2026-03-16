import { db } from '../db';
import { users } from '../db/schema/users';
import { eq, like, desc, asc, count, and } from 'drizzle-orm';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { hashPassword } from '../utils/password';
import type { CreateUserInput, UpdateUserInput } from '../validations/user';
import type { User } from '../db/schema/users';

export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestError('Email already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning();

    return user;
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: User[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (params.search) {
      whereConditions.push(like(users.fullName, `%${params.search}%`));
    }
    if (params.role) {
      whereConditions.push(eq(users.role, params.role as any));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = params.sortBy === 'fullName' ? users.fullName : users.createdAt;
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getUserById(id: number): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateUser(id: number, data: UpdateUserInput): Promise<User> {
    if (data.email) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existing.length > 0 && existing[0].id !== id) {
        throw new BadRequestError('Email already in use');
      }
    }

    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) throw new NotFoundError('User');
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    const result = await db.delete(users).where(eq(users.id, id));
    if (result.rowCount === 0) throw new NotFoundError('User');
  }

  async userExists(id: number): Promise<boolean> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return !!user;
  }

  async getUserStats(): Promise<Record<string, number>> {
    const results = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    const stats: Record<string, number> = {};
    results.forEach(({ role, count }) => {
      stats[role] = Number(count);
    });
    return stats;
  }

  async getInstructors(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.role, 'instructor'));
  }
}

export const userService = new UserService();