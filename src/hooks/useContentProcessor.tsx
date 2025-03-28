
import * as React from 'react';
import { toast } from "@/components/ui/use-toast";
import { invokeProcessFunction } from "@/services/edgeFunctionService";
import { useSettings } from '@/contexts/SettingsContext';
import { createAppError, enhanceError, determineErrorCodeFromMessage } from "@/utils/errorUtils";

// Define the valid error code types to match the ErrorDisplay component
export type ErrorCodeType = 'URL_ERROR' | 'CONNECTION_ERROR' | 'CONTENT_ERROR' | 'AI_SERVICE_ERROR' | 'PROCESSING_ERROR';

interface ContentProcessorResult {
  originalContent: string;
  summary: string;
  isLoading: boolean;
  error: Error & { errorCode?: ErrorCodeType } | null;
  progress: number;
  retry: () => void; // Add retry function to the result
}

export const useContentProcessor = (
  url: string | undefined, 
  style: string,
  bulletCount?: number
): ContentProcessorResult => {
  const [originalContent, setOriginalContent] = React.useState<string>('');
  const [summary, setSummary] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error & { errorCode?: ErrorCodeType } | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const { settings } = useSettings();
  
  // Store the latest parameters in refs to use in the retry function
  const urlRef = React.useRef(url);
  const styleRef = React.useRef(style);
  const bulletCountRef = React.useRef(bulletCount);
  const initializationAttemptedRef = React.useRef(false);
  
  // Update refs when props change
  React.useEffect(() => {
    urlRef.current = url;
    styleRef.current = style;
    bulletCountRef.current = bulletCount;
  }, [url, style, bulletCount]);

  // Create a process function that can be called directly and for retries
  const processContent = React.useCallback(async () => {
    // Use the current URL from ref
    const currentUrl = urlRef.current;
    
    if (!currentUrl) {
      setIsLoading(false);
      setError(createAppError("No URL provided", "URL_ERROR"));
      return;
    }

    console.log("Processing content with style:", styleRef.current, "and bullet count:", bulletCountRef.current, "model:", settings.model);

    setIsLoading(true);
    setError(null);
    setSummary(''); // Reset summary to avoid showing stale content
    setOriginalContent(''); // Reset original content
    setProgress(10);
    
    try {
      // Process the URL carefully to handle various encoding issues
      let processedUrl = currentUrl.trim();
      
      if (!processedUrl) {
        throw createAppError("URL is empty after processing", "URL_ERROR");
      }
      
      // Clean up URLs with nested prefixes like "rewrite.page/"
      if (processedUrl.includes('rewrite.page/')) {
        const matches = processedUrl.match(/rewrite\.page\/(\d+)?\/?(.+)/);
        if (matches && matches[2]) {
          processedUrl = matches[2];
        }
      }
      
      // Detect if URL contains protocol
      const hasProtocol = processedUrl.match(/^[a-zA-Z]+:\/\//);
      
      // Ensure the URL has a protocol prefix
      const fullUrl = hasProtocol ? processedUrl : `https://${processedUrl}`;
      
      console.log("Processing URL:", fullUrl, "with style:", styleRef.current, "and bullet count:", bulletCountRef.current, "model:", settings.model);
      setProgress(20);
      
      setProgress(40);
      
      try {
        console.log("Calling Edge Function with params:", { 
          url: fullUrl, 
          style: styleRef.current, 
          bulletCount: bulletCountRef.current, 
          model: settings.model 
        });
        
        // Use invokeProcessFunction instead of directly using supabase.functions.invoke
        const data = await invokeProcessFunction({
          url: fullUrl,
          style: styleRef.current,
          bulletCount: bulletCountRef.current,
          model: settings.model
        });
        
        console.log("Received response from Edge Function:", data);
        
        setProgress(80);
        
        if (!data.summary || data.summary.trim() === '') {
          throw createAppError("Received empty summary from AI service", "AI_SERVICE_ERROR");
        }
        
        // Add additional logging to help diagnose URL vs content issues
        console.log("Content context check:", {
          url: fullUrl,
          originalContentLength: data.originalContent ? data.originalContent.length : 0,
          summaryContentLength: data.summary ? data.summary.length : 0,
          summaryFirstWords: data.summary ? data.summary.substring(0, 100) + "..." : "N/A"
        });
        
        setSummary(data.summary);
        setOriginalContent(data.originalContent);
        setProgress(100);
        initializationAttemptedRef.current = true;
      } catch (apiError: any) {
        console.error('Error processing URL with edge function:', apiError);
        
        // If the error is a timeout error from our Promise.race
        if (apiError.message && apiError.message.includes("timed out")) {
          throw createAppError(
            "The request took too long to complete. The website might be too large or our service is experiencing high load.",
            "CONNECTION_ERROR"
          );
        }
        
        // Handle AI-specific errors that might be from the model's response
        if (apiError.message && (
            apiError.message.includes("I cannot access this URL") || 
            apiError.message.includes("cannot browse") ||
            apiError.message.includes("don't have the ability to browse") ||
            apiError.message.includes("can't access external websites")
        )) {
          throw createAppError(
            "The AI model cannot access this URL directly. Please try a different URL.",
            "CONNECTION_ERROR"
          );
        }
        
        // If the error is an AI service error about rate limiting or quota
        if (apiError.errorCode === "AI_SERVICE_ERROR" && 
           (apiError.message.includes("quota") || 
            apiError.message.includes("rate limit") || 
            apiError.message.includes("capacity"))) {
          throw createAppError(
            "Our AI service has reached its rate limit. Please try again in a few minutes or try a different URL.",
            "AI_SERVICE_ERROR"
          );
        }
        
        throw enhanceError(apiError);
      }
    } catch (error: any) {
      console.error('Error in content processing:', error);
      
      // Ensure all errors have the errorCode property for proper display
      const enhancedError = error.errorCode ? 
        error : 
        enhanceError(error);
      
      setError(enhancedError);
      initializationAttemptedRef.current = true;
      
      toast({
        title: getToastTitleForError(enhancedError.errorCode as ErrorCodeType),
        description: enhancedError.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [settings.model]);

  // Effect to process content when URL changes
  React.useEffect(() => {
    if (url && !initializationAttemptedRef.current) {
      processContent();
    }
  }, [url, style, bulletCount, settings.model, processContent]);

  // Return the retry function that calls processContent again
  return { 
    originalContent, 
    summary, 
    isLoading, 
    error, 
    progress,
    retry: processContent // Expose the retry function
  };
};

// Helper function to get user-friendly toast title based on error code
function getToastTitleForError(errorCode: ErrorCodeType): string {
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
