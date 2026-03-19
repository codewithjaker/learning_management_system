import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import { invoiceItemService } from '../services/invoiceItem.service';

export class InvoiceController {
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      // Usually only admin creates invoices manually; otherwise auto-created.
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async getAllInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.getAllInvoices(
        req.query as any,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const invoice = await invoiceService.getInvoiceById(id);
      // Permission check
      await invoiceService.checkInvoicePermission(id, req.user.id, req.user.role);
      // Also fetch its items
      const items = await invoiceItemService.getInvoiceItemsByInvoice(id, {});
      res.json({ ...invoice, items: items.data });
    } catch (error) {
      next(error);
    }
  }

  async getMyInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.getAllInvoices(
        { ...req.query, userId: req.user.id } as any,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const invoice = await invoiceService.updateInvoice(id, req.body, req.user.id, req.user.role);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await invoiceService.deleteInvoice(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async markAsPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const invoice = await invoiceService.markAsPaid(id, req.user.id, req.user.role);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();