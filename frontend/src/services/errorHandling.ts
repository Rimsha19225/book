/** Global Error Handling Service for the Physical AI & Humanoid Robotics Textbook application */

// Define error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error response interface
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

// User-friendly error messages
const USER_FRIENDLY_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection and try again.',
  [ErrorType.VALIDATION_ERROR]: 'Invalid input provided. Please check your input and try again.',
  [ErrorType.AUTHENTICATION_ERROR]: 'Authentication failed. Please log in again.',
  [ErrorType.AUTHORIZATION_ERROR]: 'Access denied. You don\'t have permission to perform this action.',
  [ErrorType.SERVER_ERROR]: 'Server error occurred. Our team has been notified. Please try again later.',
  [ErrorType.CLIENT_ERROR]: 'Client error occurred. Please try again.',
  [ErrorType.TIMEOUT_ERROR]: 'Request timed out. Please check your connection and try again.',
  [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

/**
 * Handles errors and returns a user-friendly message
 * @param error - The raw error object
 * @param context - Context of where the error occurred
 * @returns Formatted error response
 */
export const handleError = (error: any, context: string = 'unknown'): ErrorResponse => {
  let errorType: ErrorType;
  let message: string = error.message || 'An unknown error occurred';
  let details: any;
  let requestId: string | undefined;

  // Determine error type based on error characteristics
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    errorType = ErrorType.NETWORK_ERROR;
  } else if (error.status >= 400 && error.status < 500) {
    switch (error.status) {
      case 401:
        errorType = ErrorType.AUTHENTICATION_ERROR;
        break;
      case 403:
        errorType = ErrorType.AUTHORIZATION_ERROR;
        break;
      case 422:
        errorType = ErrorType.VALIDATION_ERROR;
        break;
      default:
        errorType = ErrorType.CLIENT_ERROR;
    }
  } else if (error.status >= 500) {
    errorType = ErrorType.SERVER_ERROR;
  } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    errorType = ErrorType.TIMEOUT_ERROR;
  } else {
    errorType = ErrorType.UNKNOWN_ERROR;
  }

  // Extract additional details if available
  if (error.response) {
    details = error.response.data;
    requestId = error.response.headers?.['x-request-id'];
  } else if (error.request) {
    details = { request: error.request };
  } else {
    details = { message: error.message, stack: error.stack };
  }

  // Use user-friendly message unless it's a server error (which should be generic)
  if (errorType !== ErrorType.SERVER_ERROR) {
    message = USER_FRIENDLY_MESSAGES[errorType];
  } else {
    // For server errors, use the generic message from the map
    message = USER_FRIENDLY_MESSAGES[errorType];
  }

  const errorResponse: ErrorResponse = {
    type: errorType,
    message,
    details,
    timestamp: new Date(),
    requestId
  };

  // Log the error for debugging (in a real app, this would go to an error tracking service)
  console.error(`[${context}] Error:`, errorResponse);

  return errorResponse;
};

/**
 * Shows user-friendly error notification
 * @param errorResponse - The formatted error response
 */
export const showErrorNotification = (errorResponse: ErrorResponse) => {
  // In a real application, this would use a notification library like react-toastify
  // For now, we'll use a simple alert
  alert(`Error: ${errorResponse.message}`);

  // In a real app, you might implement something like:
  // toast.error(errorResponse.message, {
  //   position: "bottom-right",
  //   autoClose: 5000,
  //   hideProgressBar: false,
  //   closeOnClick: true,
  //   pauseOnHover: true,
  //   draggable: true,
  // });
};

/**
 * Validates input data and returns validation errors
 * @param data - The data to validate
 * @param rules - Validation rules
 * @returns Array of validation errors or empty array if valid
 */
export const validateInput = (data: any, rules: Record<string, (value: any) => string | null>): string[] => {
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const error = rule(data[field]);
    if (error) {
      errors.push(`${field}: ${error}`);
    }
  }

  return errors;
};

/**
 * Retry mechanism for failed requests
 * @param fn - The function to retry
 * @param retries - Number of retries
 * @param delay - Delay between retries in ms
 * @returns Result of the function or throws if all retries fail
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < retries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
      }
    }
  }

  throw lastError;
};

/**
 * Safe wrapper for async operations with error handling
 * @param promise - The promise to wrap
 * @param context - Context for error reporting
 * @returns Object with data and error properties
 */
export const safeAwait = async <T>(
  promise: Promise<T>,
  context: string = 'unknown'
): Promise<{ data?: T; error?: ErrorResponse }> => {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    const errorResponse = handleError(error, context);
    return { error: errorResponse };
  }
};