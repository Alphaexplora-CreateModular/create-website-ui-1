export interface ContactFormSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
