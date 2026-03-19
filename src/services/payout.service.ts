// @ts-nocheck

import { db } from '../db';
import { payouts } from '../db/schema/payouts';
import { users } from '../db/schema/users';
import { eq, and, desc, asc, count, gte, lte, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreatePayoutInput, UpdatePayoutInput } from '../validations/payout';
import type { Payout } from '../db/schema/payouts';

export class PayoutService {
  // Helper to check if instructor exists
  private async ensureInstructorExists(instructorId: number): Promise<void> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, instructorId), eq(users.role, 'instructor')))
      .limit(1);
    if (!user) throw new BadRequestError('Instructor not found');
  }

  // Check permission for a payout record (for read/update/delete)
  private async checkPayoutPermission(
    payoutId: number,
    currentUserId: number,
    currentUserRole: string
  ): Promise<Payout> {
    const payout = await this.getPayoutById(payoutId);
    if (currentUserRole === 'admin') return payout;

    if (currentUserRole === 'instructor') {
      if (payout.instructorId !== currentUserId) {
        throw new ForbiddenError('You can only view your own payouts');
      }
      return payout;
    }

    throw new ForbiddenError('Insufficient permissions');
  }

  async createPayout(data: CreatePayoutInput): Promise<Payout> {
    await this.ensureInstructorExists(data.instructorId);

    // Convert date strings to Date objects
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);
    const paidAt = data.paidAt ? new Date(data.paidAt) : null;

    const [payout] = await db
      .insert(payouts)
      .values({
        instructorId: data.instructorId,
        amount: data.amount,
        periodStart,
        periodEnd,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
        status: data.status,
        paidAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return payout;
  }

  async getAllPayouts(params: {
    page?: number;
    limit?: number;
    instructorId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, currentUserId: number, currentUserRole: string): Promise<{ data: Payout[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    // Role-based filtering
    if (currentUserRole === 'instructor') {
      whereConditions.push(eq(payouts.instructorId, currentUserId));
    }
    // Admin: no extra filter

    if (params.instructorId && currentUserRole === 'admin') {
      whereConditions.push(eq(payouts.instructorId, params.instructorId));
    }
    if (params.status) {
      whereConditions.push(eq(payouts.status, params.status as any));
    }
    if (params.fromDate) {
      whereConditions.push(gte(payouts.periodStart, new Date(params.fromDate)));
    }
    if (params.toDate) {
      whereConditions.push(lte(payouts.periodEnd, new Date(params.toDate)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(payouts)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'amount': return payouts.amount;
        case 'periodStart': return payouts.periodStart;
        case 'periodEnd': return payouts.periodEnd;
        case 'paidAt': return payouts.paidAt;
        default: return payouts.createdAt;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(payouts)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getPayoutById(id: number): Promise<Payout> {
    const [payout] = await db
      .select()
      .from(payouts)
      .where(eq(payouts.id, id))
      .limit(1);

    if (!payout) throw new NotFoundError('Payout');
    return payout;
  }

  async updatePayout(id: number, data: UpdatePayoutInput, currentUserId: number, currentUserRole: string): Promise<Payout> {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can update payouts');
    }

    const payout = await this.getPayoutById(id);

    // Prepare update data with date conversion
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.paidAt) {
      updateData.paidAt = new Date(data.paidAt);
    }
    // Note: periodStart and periodEnd are not updatable in our schema, but if they were, convert them too.

    const [updated] = await db
      .update(payouts)
      .set(updateData)
      .where(eq(payouts.id, id))
      .returning();

    return updated;
  }

  async deletePayout(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can delete payouts');
    }

    const result = await db.delete(payouts).where(eq(payouts.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Payout');
  }

  /**
   * Get payouts for a specific instructor (with permission check)
   */
  async getPayoutsByInstructor(instructorId: number, currentUserId: number, currentUserRole: string): Promise<Payout[]> {
    // Permission: admin or the instructor themselves
    if (currentUserRole !== 'admin' && currentUserId !== instructorId) {
      throw new ForbiddenError('You can only view your own payouts');
    }

    return db
      .select()
      .from(payouts)
      .where(eq(payouts.instructorId, instructorId))
      .orderBy(desc(payouts.periodStart));
  }

  /**
   * Get total earnings for an instructor (sum of paid payouts)
   */
  async getTotalEarnings(instructorId: number, currentUserId: number, currentUserRole: string): Promise<number> {
    if (currentUserRole !== 'admin' && currentUserId !== instructorId) {
      throw new ForbiddenError('You can only view your own earnings');
    }

    const result = await db
      .select({
        total: sql<string>`sum(${payouts.amount})`,
      })
      .from(payouts)
      .where(and(
        eq(payouts.instructorId, instructorId),
        eq(payouts.status, 'paid')
      ));

    return result[0]?.total ? Number(result[0].total) : 0;
  }
}

export const payoutService = new PayoutService();