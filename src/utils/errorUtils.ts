
import { ErrorCodeType } from "@/hooks/useContentProcessor";

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

/**
 * Determines the appropriate error code based on error message content
 * @param message Error message to analyze
 * @returns Appropriate ErrorCodeType based on message content
 */
export const determineErrorCodeFromMessage = (message: string): ErrorCodeType => {
  if (!message) return "PROCESSING_ERROR";
  
  if (message.includes("URL") || message.includes("url format") || message.includes("domain")) {
    return "URL_ERROR";
  } else if (message.includes("fetch") || message.includes("connection") || message.includes("timed out") || 
             message.includes("network") || message.includes("down") || message.includes("access denied") ||
             message.includes("403") || message.includes("404")) {
    return "CONNECTION_ERROR";
  } else if (message.includes("content") || message.includes("extract") || message.includes("empty") || 
             message.includes("too short") || message.includes("JavaScript")) {
    return "CONTENT_ERROR";
  } else if (message.includes("API") || message.includes("AI") || message.includes("OpenRouter") || 
             message.includes("quota") || message.includes("rate limit") || message.includes("token")) {
    return "AI_SERVICE_ERROR";
  }
  return "PROCESSING_ERROR";
};

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
