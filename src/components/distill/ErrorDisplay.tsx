
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Globe, Wifi, FileText, Cpu, RefreshCw } from 'lucide-react';
import { ErrorCodeType } from '@/hooks/useContentProcessor';
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: Error & { 
    errorCode?: ErrorCodeType;
  };
  onRetry?: () => void;
}

const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  // Determine error type from error message or errorCode if available
  const errorCode = error.errorCode || determineErrorCodeFromMessage(error.message);
  
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <ErrorIcon errorCode={errorCode} />
          {getErrorTitle(errorCode)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">{error.message}</p>
        
        <Alert className="mt-2 border-amber-200 bg-amber-50">
          <AlertTitle className="text-amber-800">Suggested Fix</AlertTitle>
          <AlertDescription className="text-amber-700">
            {getSuggestionForError(errorCode)}
          </AlertDescription>
        </Alert>
        
        {onRetry && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="bg-white hover:bg-gray-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
        
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-red-500">Technical Details</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack || "No stack trace available"}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

// Determine error type based on message content
function determineErrorCodeFromMessage(message: string): ErrorCodeType {
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

// Get error title based on error code
function getErrorTitle(errorCode: ErrorCodeType): string {
  switch (errorCode) {
    case "URL_ERROR":
      return "Invalid URL";
    case "CONNECTION_ERROR":
      return "Connection Error";
    case "CONTENT_ERROR":
      return "Content Extraction Error";
    case "AI_SERVICE_ERROR":
      return "AI Service Error";
    default:
      return "Processing Error";
  }
}

// Get appropriate icon based on error type
function ErrorIcon({ errorCode }: { errorCode: ErrorCodeType }) {
  switch (errorCode) {
    case "URL_ERROR":
      return <Globe className="h-5 w-5" />;
    case "CONNECTION_ERROR":
      return <Wifi className="h-5 w-5" />;
    case "CONTENT_ERROR":
      return <FileText className="h-5 w-5" />;
    case "AI_SERVICE_ERROR":
      return <Cpu className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

// Get helpful suggestion based on error type
function getSuggestionForError(errorCode: ErrorCodeType): string {
  switch (errorCode) {
    case "URL_ERROR":
      return "Make sure your URL is correctly formatted and includes 'https://' or 'http://'. Try removing any unusual characters or parameters.";
    case "CONNECTION_ERROR":
      return "The website may be down, blocking our requests, or have security measures in place. Try a different website or check if the site is accessible in your browser.";
    case "CONTENT_ERROR":
      return "We couldn't extract meaningful content from this page. This often happens with dynamic sites, login-protected content, or pages with minimal text. Try a different page with more text content.";
    case "AI_SERVICE_ERROR":
      return "There was an issue with the AI summarization service. This could be due to high demand or service limitations. Try again in a few minutes or with a different summarization style.";
    default:
      return "Something unexpected happened. Try refreshing the page or using a different URL. If the problem persists, the service might be experiencing technical difficulties.";
  }
}

export default ErrorDisplay;
