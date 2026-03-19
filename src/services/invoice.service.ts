// @ts-nocheck
import { db } from '../db';
import { invoices } from '../db/schema/invoices';
import { users } from '../db/schema/users';
import { enrollments } from '../db/schema/enrollments';
import { courses } from '../db/schema/courses';
import { couponService } from './coupon.service'; // for using coupon
import { eq, and, count, desc, asc, sql, gte, lte, inArray } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreateInvoiceInput, UpdateInvoiceInput } from '../validations/invoice';
import type { Invoice } from '../db/schema/invoices';

export class InvoiceService {
  // Check if user exists
  private async ensureUserExists(userId: number): Promise<void> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new BadRequestError('User not found');
  }

  // Check if enrollment exists and belongs to user (if enrollmentId provided)
  private async ensureEnrollmentValid(enrollmentId: number | null | undefined, userId: number): Promise<void> {
    if (!enrollmentId) return;
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId)))
      .limit(1);
    if (!enrollment) throw new BadRequestError('Enrollment not found or does not belong to this user');
  }

  // Ensure invoice number is unique
  private async ensureInvoiceNumberUnique(invoiceNumber: string, excludeId?: number): Promise<void> {
    const query = db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    if (excludeId) {
      // we'd need ne, but use sql
      const existing = await query;
      if (existing.length > 0 && existing[0].id !== excludeId) {
        throw new BadRequestError('Invoice number already exists');
      }
    } else {
      const existing = await query.limit(1);
      if (existing.length > 0) throw new BadRequestError('Invoice number already exists');
    }
  }

  // Permission check for viewing/updating an invoice
  async checkInvoicePermission(
    invoiceId: number,
    currentUserId: number,
    currentUserRole: string
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);
    if (currentUserRole === 'admin') return invoice;

    if (currentUserRole === 'student') {
      if (invoice.userId !== currentUserId) {
        throw new ForbiddenError('You can only access your own invoices');
      }
      return invoice;
    }

    if (currentUserRole === 'instructor') {
      // Instructor can see invoices for their courses? Possibly via enrollment.
      // We'll allow instructors to view invoices if the invoice's enrollment's course belongs to them.
      if (!invoice.enrollmentId) {
        throw new ForbiddenError('Invoice not linked to an enrollment');
      }
      const [enrollment] = await db
        .select({
          instructorId: courses.instructorId,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.id, invoice.enrollmentId))
        .limit(1);
      if (!enrollment || enrollment.instructorId !== currentUserId) {
        throw new ForbiddenError('You can only view invoices for your own courses');
      }
      return invoice;
    }

    throw new ForbiddenError('Insufficient permissions');
  }

  async createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
    await this.ensureUserExists(data.userId);
    await this.ensureEnrollmentValid(data.enrollmentId, data.userId);
    await this.ensureInvoiceNumberUnique(data.invoiceNumber);

    // If couponId provided, we might want to validate and increment usage
    if (data.couponId) {
      await couponService.useCoupon(data.couponId); // this will also validate the coupon exists
    }

    const [invoice] = await db
      .insert(invoices)
      .values({
        ...data,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return invoice;
  }

  async getAllInvoices(params: {
    page?: number;
    limit?: number;
    userId?: number;
    enrollmentId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, currentUserId: number, currentUserRole: string): Promise<{ data: Invoice[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    // Role-based filters
    if (currentUserRole === 'student') {
      whereConditions.push(eq(invoices.userId, currentUserId));
    } else if (currentUserRole === 'instructor') {
      // Invoices for courses taught by instructor
      const instructorCourses = await db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.instructorId, currentUserId));
      if (instructorCourses.length === 0) {
        return { data: [], total: 0 };
      }
      const courseIds = instructorCourses.map(c => c.id);
      // Join with enrollments to filter
      const enrollmentsSubquery = db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(inArray(enrollments.courseId, courseIds))
        .as('e');
      const invoiceIdsFromEnrollments = await db
        .select({ invoiceId: invoices.id })
        .from(invoices)
        .innerJoin(enrollmentsSubquery, eq(invoices.enrollmentId, enrollmentsSubquery.id));
      if (invoiceIdsFromEnrollments.length === 0) {
        return { data: [], total: 0 };
      }
      const invoiceIds = invoiceIdsFromEnrollments.map(i => i.invoiceId);
      whereConditions.push(inArray(invoices.id, invoiceIds));
    }
    // Admin: no extra filter

    if (params.userId && currentUserRole !== 'student') {
      whereConditions.push(eq(invoices.userId, params.userId));
    }
    if (params.enrollmentId) {
      whereConditions.push(eq(invoices.enrollmentId, params.enrollmentId));
    }
    if (params.status) {
      whereConditions.push(eq(invoices.status, params.status as any));
    }
    if (params.fromDate) {
      whereConditions.push(gte(invoices.issuedAt, new Date(params.fromDate)));
    }
    if (params.toDate) {
      whereConditions.push(lte(invoices.issuedAt, new Date(params.toDate)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'invoiceNumber': return invoices.invoiceNumber;
        case 'issuedAt': return invoices.issuedAt;
        case 'paidAt': return invoices.paidAt;
        case 'total': return invoices.total;
        default: return invoices.createdAt;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getInvoiceById(id: number): Promise<Invoice> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) throw new NotFoundError('Invoice');
    return invoice;
  }

  async getInvoicesByUser(userId: number): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId));
  }

  async updateInvoice(id: number, data: UpdateInvoiceInput, currentUserId: number, currentUserRole: string): Promise<Invoice> {
    const invoice = await this.checkInvoicePermission(id, currentUserId, currentUserRole);

    // Only admins can update amounts? We'll allow instructors? Probably not. We'll restrict to admin.
    if (currentUserRole !== 'admin' && (data.subtotal !== undefined || data.discount !== undefined || data.total !== undefined)) {
      throw new ForbiddenError('Only admins can update invoice amounts');
    }

    const [updated] = await db
      .update(invoices)
      .set({
        ...data,
        paidAt: data.paidAt ? new Date(data.paidAt) : invoice.paidAt,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    return updated;
  }

  async deleteInvoice(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    const invoice = await this.checkInvoicePermission(id, currentUserId, currentUserRole);
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can delete invoices');
    }

    const result = await db.delete(invoices).where(eq(invoices.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Invoice');
  }

  async markAsPaid(id: number, currentUserId: number, currentUserRole: string): Promise<Invoice> {
    const invoice = await this.checkInvoicePermission(id, currentUserId, currentUserRole);
    if (invoice.status === 'paid') {
      throw new BadRequestError('Invoice is already paid');
    }

    const [updated] = await db
      .update(invoices)
      .set({
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    return updated;
  }
}

export const invoiceService = new InvoiceService();