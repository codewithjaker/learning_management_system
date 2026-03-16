import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import courseRoutes from './course.routes';
import syllabusSectionRoutes from './syllabusSection.routes';
import syllabusItemRoutes from './syllabusItem.routes';
import enrollmentRoutes from './enrollment.routes';
// import progressRoutes from './progress.routes';
import reviewRoutes from './review.routes';
// import couponRoutes from './coupon.routes';
// import invoiceRoutes from './invoice.routes';
// import invoiceItemRoutes from './invoiceItem.routes';
// import paymentRoutes from './payment.routes';
// import payoutRoutes from './payout.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/syllabus-sections', syllabusSectionRoutes);
router.use('/syllabus-items', syllabusItemRoutes);
router.use('/enrollments', enrollmentRoutes);
// router.use('/progress', progressRoutes);
router.use('/reviews', reviewRoutes);
// router.use('/coupons', couponRoutes);
// router.use('/invoices', invoiceRoutes);
// router.use('/invoice-items', invoiceItemRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/payouts', payoutRoutes);

export default router;