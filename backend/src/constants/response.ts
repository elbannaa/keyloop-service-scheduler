export enum ErrorCode {
  UNKNOWN = "UNKNOWN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}

export const Messages = {
  SUCCESS: "Request successful",
  VALIDATION_ERROR: "Validation failed",
  UNAUTHORIZED: "Unauthorized",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Something went wrong"
};

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: any;
}
