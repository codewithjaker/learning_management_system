import { z } from 'zod';

const optionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().min(0).optional(),
});

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  points: z.number().positive('Points must be positive').default(1),
  orderIndex: z.number().int().min(0).optional(),
  explanation: z.string().optional(),
  options: z.array(optionSchema).optional(),
}).refine(
  (data) => {
    if (data.questionType !== 'short_answer' && (!data.options || data.options.length < 2)) {
      return false;
    }
    return true;
  },
  { message: 'Multiple choice/true‑false questions must have at least two options', path: ['options'] }
);

export const createQuizSchema = z.object({
  body: z.object({
    syllabusItemId: z.number().int().positive(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    timeLimit: z.number().int().positive().nullable().optional(),
    passingScore: z.number().min(0).max(100).default(70),
    maxAttempts: z.number().int().positive().default(1),
    shuffleQuestions: z.boolean().default(false),
    showResults: z.boolean().default(true),
    questions: z.array(questionSchema).min(1, 'At least one question required'),
  }),
});

export const updateQuizSchema = z.object({
  params: z.object({ id: z.string().transform(Number) }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    timeLimit: z.number().int().positive().nullable().optional(),
    passingScore: z.number().min(0).max(100).optional(),
    maxAttempts: z.number().int().positive().optional(),
    shuffleQuestions: z.boolean().optional(),
    showResults: z.boolean().optional(),
    questions: z.array(questionSchema).optional(),
  }).refine(data => Object.keys(data).length > 0, { message: 'At least one field to update' }),
});

export const startQuizSchema = z.object({
  params: z.object({ quizId: z.string().transform(Number) }),
});

export const submitQuizSchema = z.object({
  params: z.object({ attemptId: z.string().transform(Number) }),
  body: z.object({
    answers: z.array(z.object({
      questionId: z.number().int().positive(),
      selectedOptionId: z.number().int().positive().optional(),
      textAnswer: z.string().optional(),
    })).min(1),
  }),
});

export const getQuizResultSchema = z.object({
  params: z.object({ attemptId: z.string().transform(Number) }),
});

export const getAttemptHistorySchema = z.object({
  params: z.object({ quizId: z.string().transform(Number) }),
});

export const getQuizByIdSchema = z.object({
  params: z.object({ id: z.string().transform(Number) }),
});

export const getQuizBySyllabusItemSchema = z.object({
  params: z.object({ syllabusItemId: z.string().transform(Number) }),
});


