export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  timestamp: Date;

  constructor(success: boolean, message: string, data?: T, errors?: any[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date();
  }

  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message = 'Error', errors?: any[]): ApiResponse<null> {
    return new ApiResponse(false, message, null, errors);
  }

  static paginated<T>(
    data: T[], 
    page: number, 
    limit: number, 
    total: number, 
    message = 'Success'
  ) {
    return new ApiResponse(true, message, {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}