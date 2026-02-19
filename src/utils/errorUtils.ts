
import { ErrorCodeType, determineErrorCodeFromMessage } from "@/core/errors";

/**
 * Creates an error object with an assigned error code
 * @param message Error message
 * @param errorCode Optional specific error code, will be inferred from message otherwise
 * @returns Enhanced error object with errorCode property
 */
export const createAppError = (message: string, errorCode?: ErrorCodeType): Error & { errorCode: ErrorCodeType } => {
  return Object.assign(
    new Error(message),
    { errorCode: errorCode || determineErrorCodeFromMessage(message) }
  );
};

// determineErrorCodeFromMessage moved to @/core/errors

/**
 * Enhances an existing error with an error code if not already present
 * @param error Original error
 * @returns Enhanced error with errorCode property
 */
export const enhanceError = (error: any): Error & { errorCode: ErrorCodeType } => {
  if (error.errorCode) {
    return error as Error & { errorCode: ErrorCodeType };
  }

  return createAppError(error.message || "Unknown error");
};
