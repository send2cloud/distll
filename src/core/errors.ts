export type ErrorCodeType = 'URL_ERROR' | 'CONNECTION_ERROR' | 'CONTENT_ERROR' | 'AI_SERVICE_ERROR' | 'PROCESSING_ERROR';

export function determineErrorCodeFromMessage(message: string): ErrorCodeType {
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
}

export function getToastTitleForError(errorCode: ErrorCodeType): string {
  switch (errorCode) {
    case "URL_ERROR":
      return "Invalid URL";
    case "CONNECTION_ERROR":
      return "Connection Problem";
    case "CONTENT_ERROR":
      return "Content Issue";
    case "AI_SERVICE_ERROR":
      return "AI Service Issue";
    default:
      return "Error";
  }
}
