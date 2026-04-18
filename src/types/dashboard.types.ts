export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayouts: number;
  totalReviews: number;
  averageRating: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface EnrollmentData {
  month: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'payment' | 'review' | 'course';
  user: string;
  course?: string;
  amount?: number;
  timestamp: string;
  description: string;
}