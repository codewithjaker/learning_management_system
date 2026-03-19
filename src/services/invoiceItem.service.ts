// @ts-nocheck
import { db } from '../db';
import { invoiceItems } from '../db/schema/invoiceItems';
import { invoices } from '../db/schema/invoices';
import { eq, and, count, desc, asc } from 'drizzle-orm';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import type { CreateInvoiceItemInput, UpdateInvoiceItemInput } from '../validations/invoiceItem';
import type { InvoiceItem } from '../db/schema/invoiceItems';

export class InvoiceItemService {
  // Check if invoice exists and optionally check permission (delegated to caller)
  private async ensureInvoiceExists(invoiceId: number): Promise<void> {
    const [invoice] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);
    if (!invoice) throw new BadRequestError('Invoice not found');
  }

  async createInvoiceItem(data: CreateInvoiceItemInput, currentUserId: number, currentUserRole: string): Promise<InvoiceItem> {
    await this.ensureInvoiceExists(data.invoiceId);
    // Permission: only admins can add items? Or also invoice owner? Typically items are added during invoice creation.
    // For simplicity, we'll allow admins only for direct item creation.
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can create invoice items directly');
    }

    const [item] = await db
      .insert(invoiceItems)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return item;
  }

  async getInvoiceItemsByInvoice(invoiceId: number, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: InvoiceItem[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const totalResult = await db
      .select({ count: count() })
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
    const total = Number(totalResult[0]?.count) || 0;

    const sortColumn = (() => {
      switch (params.sortBy) {
        case 'courseName': return invoiceItems.courseName;
        case 'unitPrice': return invoiceItems.unitPrice;
        case 'total': return invoiceItems.total;
        default: return invoiceItems.createdAt;
      }
    })();
    const sortOrder = params.sortOrder === 'desc' ? desc : asc;

    const data = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(sortOrder(sortColumn))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async getInvoiceItemById(id: number): Promise<InvoiceItem> {
    const [item] = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.id, id))
      .limit(1);

    if (!item) throw new NotFoundError('Invoice item');
    return item;
  }

  async updateInvoiceItem(id: number, data: UpdateInvoiceItemInput, currentUserId: number, currentUserRole: string): Promise<InvoiceItem> {
    const item = await this.getInvoiceItemById(id);
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can update invoice items');
    }

    const [updated] = await db
      .update(invoiceItems)
      .set(data)
      .where(eq(invoiceItems.id, id))
      .returning();

    return updated;
  }

  async deleteInvoiceItem(id: number, currentUserId: number, currentUserRole: string): Promise<void> {
    const item = await this.getInvoiceItemById(id);
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Only admins can delete invoice items');
    }

    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    if (result.rowCount === 0) throw new NotFoundError('Invoice item');
  }
}

export const invoiceItemService = new InvoiceItemService();