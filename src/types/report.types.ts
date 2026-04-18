export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface GroupByOptions {
  groupBy?: 'day' | 'month' | 'year';
}

export interface SalesReportData {
  period: string;
  totalRevenue: number;
  totalEnrollments: number;
  averageOrderValue: number;
}

export interface SalesReportResponse {
  data: SalesReportData[];
  summary: {
    totalRevenue: number;
    totalEnrollments: number;
    averageOrderValue: number;
  };
}

export interface UserReportData {
  period: string;
  newUsers: number;
  newStudents: number;
  newInstructors: number;
}

export interface UserReportResponse {
  data: UserReportData[];
  summary: {
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
  };
}

export interface CourseReportData {
  courseId: number;
  title: string;
  enrollments: number;
  completed: number;
  revenue: number;
  averageRating: number;
}

export interface EnrollmentReportData {
  period: string;
  active: number;
  completed: number;
  refunded: number;
}

export interface PaymentReportData {
  period: string;
  totalAmount: number;
  count: number;
}

export interface PaymentMethodReport {
  method: string;
  totalAmount: number;
  count: number;
}

export interface InstructorEarningsData {
  instructorId: number;
  name: string;
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
}