import { Request, Response, NextFunction } from 'express';
import { invoiceItemService } from '../services/invoiceItem.service';

export class InvoiceItemController {
  async createInvoiceItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await invoiceItemService.createInvoiceItem(req.body, req.user.id, req.user.role);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceItemsByInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = Number(req.query.invoiceId);
      const result = await invoiceItemService.getInvoiceItemsByInvoice(invoiceId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const item = await invoiceItemService.getInvoiceItemById(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async updateInvoiceItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const item = await invoiceItemService.updateInvoiceItem(id, req.body, req.user.id, req.user.role);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async deleteInvoiceItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await invoiceItemService.deleteInvoiceItem(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceItemController = new InvoiceItemController();