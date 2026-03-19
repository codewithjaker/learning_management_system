// @ts-nocheck
import { db } from '../db';
import { payments } from '../db/schema/payments';
import { invoices } from '../db/schema/invoices';
import { users } from '../db/schema/users';
import { eq, and, desc, asc, count, gte, lte, sql } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { invoiceService } from './invoice.service'; // we'll need this to update invoice status
import type { CreatePaymentInput, UpdatePaymentInput, CompletePaymentInput } from '../validations/payment';
import type { Payment } from '../db/schema/payments';

export class PaymentService {
  // Helper to check if invoice exists and optionally get its userId
  private async ensureInvoiceExists(invoiceId: number): Promise<{ userId: number; total: string }> {
    const [invoice] = await db
      .select({ userId: invoices.userId, total: invoices.total })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    if (!invoice) throw new BadRequestError('Invoice not found');
    return invoice;
  }

  // Helper to update invoice status based on total paid
  private async updateInvoiceStatus(invoiceId: number): Promise<void> {
    // Get invoice total
    const [invoice] = await db
      .select({ total: invoices.total })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    if (!invoice) return;

    // Sum all completed payments for this invoice
    const result = await db
      .select({
        totalPaid: sql<string>`sum(${payments.amount})`,
      })
      .from(payments)
      .where(and(
        eq(payments.invoiceId, invoiceId),
        eq(payments.status, 'completed')
      ));

    const totalPaid = result[0]?.totalPaid ? Number(result[0].totalPaid) : 0;
    const invoiceTotal = Number(invoice.total);

    let newStatus: 'pending' | 'paid' | 'refunded' | 'cancelled' = 'pending';
    if (totalPaid >= invoiceTotal) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'pending'; // partially paid
    }

    await db
      .update(invoices)
      .set({
        status: newStatus,
        paidAt: newStatus === 'paid' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));
  }

  // Check permission for a payment record (for read/update/delete)
  private async checkPaymentPermission(
    paymentId: number,
    currentUserId: number,
    currentUserRole: string
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);
    if (currentUserRole === 'admin') return payment;

    // Get invoice to know userId
    const [invoice] = await db
      .select({ userId: invoices.userId })
      .from(invoices)
      .where(eq(invoices.id, payment.invoiceId))
      .limit(1);
    if (!invoice) throw new NotFoundError('Invoice');

    if (currentUserRole === 'student') {
      if (invoice.userId !== currentUserId) {
        throw new ForbiddenError('You can only view your own payments');
      }
      return payment;
    }

    if (currentUserRole === 'instructor') {
      // Instructors cannot view payments (financial data) – only admins and the student themselves.
      throw new ForbiddenError('Instructors cannot view payment details');
    }

    throw new ForbiddenError('Insufficient permissions');
  }

  async createPayment(data: CreatePaymentInput, currentUserId: number, currentUserRole: string): Promise<Payment> {
    // Only admins can create payments manually; students should use checkout flow (which would call this after gateway)
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can manually create payments');
    }

    const invoice = await this.ensureInvoiceExists(data.invoiceId);

    // Generate receipt number if not provided
    if (!data.receiptNumber) {
      data.receiptNumber = `RCT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // If status is completed and paidAt not set, set to now
    if (data.status === 'completed' && !data.paidAt) {
      data.paidAt = new Date().toISOString();
    }

    const [payment] = await db
      .insert(payments)
      .values({
        ...data,
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Update invoice status
    await this.updateInvoiceStatus(data.invoiceId);

    return payment;
  }

  async getAllPayments(params: {
    page?: number;
    limit?: number;
    invoiceId?: number;
    userId?: number;
    status?: string;
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, currentUserId: number, currentUserRole: string): Promise<{ data: Payment[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    // Role-based filtering
    if (currentUserRole === 'student') {
      // Students can only see payments for their own invoices
      const userInvoices = await db
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.userId, currentUserId));
      if (userInvoices.length === 0) {
        return { data: [], total: 0 };
      }
      const invoiceIds = userInvoices.map(i => i.id);
      whereConditions.push(sql`${payments.invoiceId} IN (${sql.join(invoiceIds, sql`, `)})`);
    } else if (currentUserRole === 'instructor') {
      // Instructors cannot view payments
      throw new ForbiddenError('Instructors cannot view payments');
    }
    // Admin: no extra filter

    if (params.invoiceId) {
      whereConditions.push(eq(payments.invoiceId, params.invoiceId));
    }
    if (params.userId && currentUserRole === 'admin') {
      // Filter by user via invoices
      const userInvoices = await db
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.userId, params.userId));
      if (userInvoices.length > 0) {
        const invoiceIds = userInvoices.map(i => i.id);
        whereConditions.push(sql`${payments.invoiceId} IN (${sql.join(invoiceIds, sql`, `)})`);
      } else {
        return { data: [], total: 0 };
      }
    }
    if (params.status) {
      whereConditions.push(eq(payments.status, params.status as any));
    }
    if (params.paymentMethod) {
      whereConditions.push(eq(payments.paymentMethod, params.paymentMethod as any));
    }
    if (params.fromDate) {
      whereConditions.push(gte(payments.paidAt, new Date(params.fromDate)));
    }
    if (params.toDate) {
      whereConditions.push(lte(payments.paidAt, new Date(params.toDate)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(payments)
      .where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'amount': return payments.amount;
        case 'paidAt': return payments.paidAt;
        case 'updatedAt': return payments.updatedAt;
        default: return payments.createdAt;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(payments)
      .where(whereClause)
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getPaymentById(id: number): Promise<Payment> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (!payment) throw new NotFoundError('Payment');
    return payment;
  }

  async updatePayment(id: number, data: UpdatePaymentInput, currentUserId: number, currentUserRole: string): Promise<Payment> {
    // Only admins can update payments (or webhooks might update status, but we'll treat as admin)
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can update payments');
    }

    const payment = await this.getPaymentById(id);

    const [updated] = await db
      .update(payments)
      .set({
        ...data,
        paidAt: data.paidAt ? new Date(data.paidAt) : payment.paidAt,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    // If status changed, update invoice status
    if (data.status && data.status !== payment.status) {
      await this.updateInvoiceStatus(payment.invoiceId);
    }

    return updated;
  }

  async deletePayment(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can delete payments');
    }

    const payment = await this.getPaymentById(id);
    const result = await db.delete(payments).where(eq(payments.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Payment');

    // Update invoice status after deletion
    await this.updateInvoiceStatus(payment.invoiceId);
  }

  /**
   * Complete a payment (used by webhook or admin)
   */
  async completePayment(id: number, data: CompletePaymentInput, currentUserId: number, currentUserRole: string): Promise<Payment> {
    // Allow admins or the system (webhook) to complete payments
    if (currentUserRole !== 'admin' && currentUserRole !== 'system') {
      throw new ForbiddenError('Only admins can mark payments as completed');
    }

    const payment = await this.getPaymentById(id);

    const [updated] = await db
      .update(payments)
      .set({
        status: 'completed',
        transactionId: data.transactionId ?? payment.transactionId,
        gatewayResponse: data.gatewayResponse ?? payment.gatewayResponse,
        receiptNumber: data.receiptNumber ?? payment.receiptNumber,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();

    // Update invoice status
    await this.updateInvoiceStatus(payment.invoiceId);

    return updated;
  }

  /**
   * Get payments for a specific invoice (with permission check)
   */
  async getPaymentsByInvoice(invoiceId: number, currentUserId: number, currentUserRole: string): Promise<Payment[]> {
    // Check permission: students can only see their own invoice payments
    if (currentUserRole === 'student') {
      const [invoice] = await db
        .select({ userId: invoices.userId })
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);
      if (!invoice || invoice.userId !== currentUserId) {
        throw new ForbiddenError('You can only view payments for your own invoices');
      }
    } else if (currentUserRole === 'instructor') {
      throw new ForbiddenError('Instructors cannot view payments');
    }

    return db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paidAt));
  }
}

export const paymentService = new PaymentService();