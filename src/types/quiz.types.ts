export interface QuizOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface QuizQuestion {
  id?: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  orderIndex?: number;
  explanation?: string;
  options?: QuizOption[];
}

export interface Quiz {
  id: number;
  syllabusItemId: number;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions?: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizInput {
  syllabusItemId: number;
  title: string;
  description?: string;
  timeLimit?: number | null;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  questions: Omit<QuizQuestion, 'id'>[];
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  timeLimit?: number | null;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  questions?: Omit<QuizQuestion, 'id'>[];
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  passed: boolean | null;
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface QuizAnswer {
  questionId: number;
  selectedOptionId?: number;
  textAnswer?: string;
}

export interface SubmitQuizInput {
  attemptId: number;
  answers: QuizAnswer[];
}

export interface QuizResult {
  attemptId: number;
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  answers: Array<{
    questionId: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string;
  }>;
}