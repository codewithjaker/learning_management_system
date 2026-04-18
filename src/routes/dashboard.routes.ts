import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', dashboardController.getStats);
router.get('/revenue', dashboardController.getRevenueData);
router.get('/enrollments', dashboardController.getEnrollmentData);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;