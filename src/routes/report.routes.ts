import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All report routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/sales', reportController.getSalesReport);
router.get('/users', reportController.getUserReport);
router.get('/courses', reportController.getCourseReport);
router.get('/enrollments', reportController.getEnrollmentReport);
router.get('/payments', reportController.getPaymentReport);
router.get('/payment-methods', reportController.getPaymentMethodReport);
router.get('/instructor-earnings', reportController.getInstructorEarningsReport);

export default router;