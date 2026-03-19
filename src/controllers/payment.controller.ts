import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.createPayment(req.body, req.user.id, req.user.role);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.getAllPayments(req.query as any, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const payment = await paymentService.getPaymentById(id);
      // Check permission
      await paymentService['checkPaymentPermission'](id, req.user.id, req.user.role);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const payment = await paymentService.updatePayment(id, req.body, req.user.id, req.user.role);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async deletePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await paymentService.deletePayment(id, req.user.id, req.user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async completePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      // Allow webhook to call with a special role; here we assume admin or system
      // For simplicity, we'll allow authenticated users with admin role, or a special header could be used
      const payment = await paymentService.completePayment(id, req.body, req.user.id, req.user.role);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      const payments = await paymentService.getPaymentsByInvoice(invoiceId, req.user.id, req.user.role);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();