// src/services/quiz.service.ts
import { db } from '../db';
import { quizzes, quizQuestions, questionOptions, quizAttempts, quizAnswers } from '../db/schema';
import { syllabusItems } from '../db/schema/syllabusItems';
import { users } from '../db/schema/users';
import { eq, and, asc } from 'drizzle-orm';
import { NotFoundError, BadRequestError } from '../utils/errors';
import type { CreateQuizInput, UpdateQuizInput, SubmitQuizInput, QuizResult } from '../types/quiz.types';

type QuestionWithOptions = typeof quizQuestions.$inferSelect & {
  options: typeof questionOptions.$inferSelect[];
};

export class QuizService {
  // ========== Private helpers ==========
  private async ensureQuizExists(id: number) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    if (!quiz) throw new NotFoundError('Quiz');
    return quiz;
  }

  private async ensureSyllabusItemExists(syllabusItemId: number) {
    const [item] = await db.select().from(syllabusItems).where(eq(syllabusItems.id, syllabusItemId));
    if (!item) throw new BadRequestError('Syllabus item not found');
  }

  private async ensureUserExists(userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new BadRequestError('User not found');
  }

  private async ensureAttemptOwnership(attemptId: number, userId: number) {
    const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId));
    if (!attempt) throw new NotFoundError('Quiz attempt');
    if (attempt.userId !== userId) throw new BadRequestError('You do not have access to this attempt');
    return attempt;
  }

  // Convert decimal string to number (helper)
  private toNumber(value: string | null): number {
    return value === null ? 0 : parseFloat(value);
  }

  // ========== CRUD for Quizzes (Instructor/Admin) ==========
  async createQuiz(data: CreateQuizInput) {
    await this.ensureSyllabusItemExists(data.syllabusItemId);

    // Convert number fields to strings for decimal columns
    const [quiz] = await db.insert(quizzes).values({
      syllabusItemId: data.syllabusItemId,
      title: data.title,
      description: data.description,
      timeLimit: data.timeLimit,
      passingScore: (data.passingScore ?? 70).toString(),
      maxAttempts: data.maxAttempts ?? 1,
      shuffleQuestions: data.shuffleQuestions ?? false,
      showResults: data.showResults ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Insert questions and options
    for (const q of data.questions) {
      const [question] = await db.insert(quizQuestions).values({
        quizId: quiz.id,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points.toString(),
        orderIndex: q.orderIndex ?? 0,
        explanation: q.explanation,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      if (q.options && q.options.length > 0) {
        await db.insert(questionOptions).values(
          q.options.map((opt, idx) => ({
            questionId: question.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            orderIndex: opt.orderIndex ?? idx,
          }))
        );
      }
    }

    return this.getQuizById(quiz.id);
  }

  async getQuizById(id: number) {
    const quiz = await this.ensureQuizExists(id);
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, id))
      .orderBy(quizQuestions.orderIndex);

    const questionsWithOptions: QuestionWithOptions[] = [];
    for (const q of questions) {
      const options = await db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, q.id))
        .orderBy(questionOptions.orderIndex);
      questionsWithOptions.push({ ...q, options });
    }

    // Convert decimal strings to numbers
    return {
      ...quiz,
      passingScore: this.toNumber(quiz.passingScore),
      questions: questionsWithOptions.map(q => ({
        ...q,
        points: this.toNumber(q.points),
        options: q.options.map(opt => ({ ...opt, isCorrect: opt.isCorrect ?? false })),
      })),
    };
  }

  async getQuizBySyllabusItem(syllabusItemId: number) {
    await this.ensureSyllabusItemExists(syllabusItemId);
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.syllabusItemId, syllabusItemId));
    if (!quiz) throw new NotFoundError('Quiz not found for this syllabus item');
    return this.getQuizById(quiz.id);
  }

  async updateQuiz(id: number, data: UpdateQuizInput) {
    await this.ensureQuizExists(id);

    // Build update object with proper decimal conversion
    const updateFields: Partial<typeof quizzes.$inferInsert> = {};
    if (data.title !== undefined) updateFields.title = data.title;
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.timeLimit !== undefined) updateFields.timeLimit = data.timeLimit;
    if (data.passingScore !== undefined) updateFields.passingScore = data.passingScore.toString();
    if (data.maxAttempts !== undefined) updateFields.maxAttempts = data.maxAttempts;
    if (data.shuffleQuestions !== undefined) updateFields.shuffleQuestions = data.shuffleQuestions;
    if (data.showResults !== undefined) updateFields.showResults = data.showResults;
    if (Object.keys(updateFields).length > 0) {
      await db.update(quizzes).set({ ...updateFields, updatedAt: new Date() }).where(eq(quizzes.id, id));
    }

    // Replace questions if provided
    if (data.questions) {
      const existingQuestions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, id));
      for (const q of existingQuestions) {
        await db.delete(questionOptions).where(eq(questionOptions.questionId, q.id));
      }
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, id));

      for (const q of data.questions) {
        const [question] = await db.insert(quizQuestions).values({
          quizId: id,
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points.toString(),
          orderIndex: q.orderIndex ?? 0,
          explanation: q.explanation,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        if (q.options && q.options.length > 0) {
          await db.insert(questionOptions).values(
            q.options.map((opt, idx) => ({
              questionId: question.id,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              orderIndex: opt.orderIndex ?? idx,
            }))
          );
        }
      }
    }

    return this.getQuizById(id);
  }

  async deleteQuiz(id: number) {
    await this.ensureQuizExists(id);
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // ========== Student taking the quiz ==========
  async startQuiz(quizId: number, userId: number) {
    await this.ensureQuizExists(quizId);
    await this.ensureUserExists(userId);

    const quiz = await this.getQuizById(quizId);
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId)));

    if (attempts.length >= (quiz.maxAttempts ?? 1)) {
      throw new BadRequestError(`Maximum attempts (${quiz.maxAttempts}) reached`);
    }

    const inProgress = attempts.find(a => a.status === 'in_progress');
    if (inProgress) return inProgress;

    const [attempt] = await db.insert(quizAttempts).values({
      userId,
      quizId,
      startedAt: new Date(),
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return attempt;
  }

  async submitQuiz(attemptId: number, userId: number, data: SubmitQuizInput) {
    const attempt = await this.ensureAttemptOwnership(attemptId, userId);
    if (attempt.status !== 'in_progress') throw new BadRequestError('Quiz already submitted');

    const quiz = await this.getQuizById(attempt.quizId);
    const questions = quiz.questions || [];

    let totalPoints = 0;
    let earnedPoints = 0;
    const answerRecords: typeof quizAnswers.$inferInsert[] = [];

    for (const answer of data.answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const questionPoints = question.points;
      totalPoints += questionPoints;

      let isCorrect = false;
      let pointsEarned = 0;
      let correctAnswer = '';
      let userAnswer = '';

      if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
        const selectedOption = question.options?.find(opt => opt.id === answer.selectedOptionId);
        userAnswer = selectedOption?.optionText || '';
        isCorrect = !!selectedOption?.isCorrect;
        const correctOption = question.options?.find(opt => opt.isCorrect);
        correctAnswer = correctOption?.optionText || '';
        pointsEarned = isCorrect ? questionPoints : 0;
      } else if (question.questionType === 'short_answer') {
        userAnswer = answer.textAnswer || '';
        const correctOption = question.options?.find(opt => opt.isCorrect);
        if (correctOption && userAnswer.trim().toLowerCase() === correctOption.optionText.trim().toLowerCase()) {
          isCorrect = true;
          pointsEarned = questionPoints;
        } else {
          isCorrect = false;
          pointsEarned = 0;
        }
        correctAnswer = correctOption?.optionText || '';
      }

      earnedPoints += pointsEarned;
      answerRecords.push({
        attemptId,
        questionId: question.id,
        selectedOptionId: answer.selectedOptionId,
        textAnswer: answer.textAnswer,
        isCorrect,
        pointsEarned: pointsEarned.toString(), // store as string
      });
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;

    await db.update(quizAttempts).set({
      submittedAt: new Date(),
      score: score.toString(),       // convert to string
      passed,
      status: 'submitted',
      updatedAt: new Date(),
    }).where(eq(quizAttempts.id, attemptId));

    if (answerRecords.length) {
      await db.insert(quizAnswers).values(answerRecords);
    }

    return { attemptId, score, passed };
  }

  async getQuizResult(attemptId: number, userId: number): Promise<QuizResult> {
    const attempt = await this.ensureAttemptOwnership(attemptId, userId);
    const quiz = await this.getQuizById(attempt.quizId);
    const answers = await db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.attemptId, attemptId));

    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedAnswers: QuizResult['answers'] = [];

    for (const a of answers) {
      const question = quiz.questions?.find(q => q.id === a.questionId);
      if (!question) continue;

      const points = question.points;
      totalPoints += points;
      const earned = this.toNumber(a.pointsEarned);
      earnedPoints += earned;

      let userAnswer = '';
      if (a.selectedOptionId) {
        const opt = question.options?.find(o => o.id === a.selectedOptionId);
        userAnswer = opt?.optionText || '';
      } else if (a.textAnswer) {
        userAnswer = a.textAnswer;
      }
      const correctOption = question.options?.find(o => o.isCorrect);
      const correctAnswer = correctOption?.optionText || '';

      detailedAnswers.push({
        questionId: question.id,
        questionText: question.questionText,
        userAnswer,
        correctAnswer,
        isCorrect: a.isCorrect ?? false,
        pointsEarned: earned,
        //@ts-ignore
        explanation: question.explanation,
      });
    }

    return {
      attemptId,
      score: this.toNumber(attempt.score),
      passed: attempt.passed ?? false,
      totalPoints,
      earnedPoints,
      answers: detailedAnswers,
    };
  }

  async getAttemptHistory(quizId: number, userId: number) {
    await this.ensureQuizExists(quizId);
    await this.ensureUserExists(userId);
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, userId)))
      .orderBy(asc(quizAttempts.createdAt));

    // Convert decimal fields to numbers
    return attempts.map(a => ({
      ...a,
      score: a.score !== null ? this.toNumber(a.score) : null,
    }));
  }
}

export const quizService = new QuizService();