import { Router } from 'express';
import { syllabusSectionController } from '../controllers/syllabusSection.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  getSectionParamsSchema,
  getSectionsByCourseQuerySchema,
  deleteSectionParamsSchema,
} from '../validations/syllabusSection.validation';

const router = Router();

// Public: anyone can view sections (for a published course)
router.get(
  '/',
  validate(getSectionsByCourseQuerySchema),
  syllabusSectionController.getSectionsByCourse
);

router.get(
  '/:id',
  validate(getSectionParamsSchema),
  syllabusSectionController.getSectionById
);

// Protected: instructors/admins can manage sections
router.use(authenticate, authorize('instructor', 'admin'));

router.post(
  '/',
  validate(createSectionSchema),
  syllabusSectionController.createSection
);

router.patch(
  '/:id',
  validate(updateSectionSchema),
  syllabusSectionController.updateSection
);

router.delete(
  '/:id',
  validate(deleteSectionParamsSchema),
  syllabusSectionController.deleteSection
);

export default router;