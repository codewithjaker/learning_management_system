import { Request, Response, NextFunction } from 'express';
import { quizService } from '../services/quiz.service';

export class QuizController {
  // ========== Admin / Instructor ==========
  async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await quizService.createQuiz(req.body);
      res.status(201).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  async getQuizById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const quiz = await quizService.getQuizById(id);
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  }

  async getQuizBySyllabusItem(req: Request, res: Response, next: NextFunction) {
    try {
      const syllabusItemId = Number(req.params.syllabusItemId);
      const quiz = await quizService.getQuizBySyllabusItem(syllabusItemId);
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  }

  async updateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const quiz = await quizService.updateQuiz(id, req.body);
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  }

  async deleteQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await quizService.deleteQuiz(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ========== Student ==========
  async startQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const quizId = Number(req.params.quizId);
      const attempt = await quizService.startQuiz(quizId, req.user.id);
      res.json(attempt);
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const attemptId = Number(req.params.attemptId);
      const result = await quizService.submitQuiz(attemptId, req.user.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getQuizResult(req: Request, res: Response, next: NextFunction) {
    try {
      const attemptId = Number(req.params.attemptId);
      const result = await quizService.getQuizResult(attemptId, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAttemptHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const quizId = Number(req.params.quizId);
      const history = await quizService.getAttemptHistory(quizId, req.user.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}

export const quizController = new QuizController();