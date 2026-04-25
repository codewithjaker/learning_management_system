import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createQuizSchema,
  updateQuizSchema,
  startQuizSchema,
  submitQuizSchema,
  getQuizResultSchema,
  getAttemptHistorySchema,
  getQuizByIdSchema,
  getQuizBySyllabusItemSchema,
} from '../validations/quiz.validation';

const router = Router();

// Public (authenticated) routes – anyone can view quiz details
router.get('/syllabus-item/:syllabusItemId', authenticate, validate(getQuizBySyllabusItemSchema), quizController.getQuizBySyllabusItem);
router.get('/:id', authenticate, validate(getQuizByIdSchema), quizController.getQuizById);

// Instructor/Admin – manage quizzes
router.use(authenticate);
router.post('/', authorize('instructor', 'admin'), validate(createQuizSchema), quizController.createQuiz);
router.put('/:id', authorize('instructor', 'admin'), validate(updateQuizSchema), quizController.updateQuiz);
router.delete('/:id', authorize('instructor', 'admin'), quizController.deleteQuiz);

// Student – taking quizzes
router.post('/:quizId/start', authenticate, validate(startQuizSchema), quizController.startQuiz);
router.post('/attempts/:attemptId/submit', authenticate, validate(submitQuizSchema), quizController.submitQuiz);
router.get('/attempts/:attemptId/result', authenticate, validate(getQuizResultSchema), quizController.getQuizResult);
router.get('/:quizId/history', authenticate, validate(getAttemptHistorySchema), quizController.getAttemptHistory);

export default router;