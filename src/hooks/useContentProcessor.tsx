
import { useState, useEffect } from 'react';
import { SummarizationStyle } from '@/types/settings';
import { toast } from "@/components/ui/use-toast";
import { invokeProcessFunction } from "@/services/edgeFunctionService";

// Define the valid error code types to match the ErrorDisplay component
export type ErrorCodeType = 'URL_ERROR' | 'CONNECTION_ERROR' | 'CONTENT_ERROR' | 'AI_SERVICE_ERROR' | 'PROCESSING_ERROR';

interface ContentProcessorResult {
  originalContent: string;
  summary: string;
  isLoading: boolean;
  error: Error & { errorCode?: ErrorCodeType } | null;
  progress: number;
}

export const useContentProcessor = (
  url: string | undefined, 
  style: SummarizationStyle,
  bulletCount?: number
): ContentProcessorResult => {
  const [originalContent, setOriginalContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error & { errorCode?: ErrorCodeType } | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setError(Object.assign(new Error("No URL provided"), { errorCode: "URL_ERROR" as ErrorCodeType }));
      return;
    }

    console.log("Processing content with style:", style, "and bullet count:", bulletCount);

    const processContent = async () => {
      setIsLoading(true);
      setError(null);
      setSummary(''); // Reset summary to avoid showing stale content
      setOriginalContent(''); // Reset original content
      setProgress(10);
      
      try {
        // Process the URL carefully to handle various encoding issues
        let processedUrl = url.trim();
        
        if (!processedUrl) {
          throw Object.assign(new Error("URL is empty after processing"), { errorCode: "URL_ERROR" as ErrorCodeType });
        }
        
        // Detect if URL contains protocol
        const hasProtocol = processedUrl.match(/^[a-zA-Z]+:\/\//);
        
        // Ensure the URL has a protocol prefix
        const fullUrl = hasProtocol ? processedUrl : `https://${processedUrl}`;
        
        console.log("Processing URL:", fullUrl, "with style:", style, "and bullet count:", bulletCount);
        setProgress(20);
        
        setProgress(40);
        
        try {
          console.log("Calling Edge Function with params:", { url: fullUrl, style, bulletCount });
          
          // Convert style to a string value
          const styleValue = style || 'standard';
          
          // Use invokeProcessFunction to call the process-url edge function
          const data = await invokeProcessFunction({
            url: fullUrl,
            style: styleValue,
            bulletCount: bulletCount
          });
          
          console.log("Received response from Edge Function:", data);
          
          setProgress(80);
          
          if (!data.summary || data.summary.trim() === '') {
            throw Object.assign(
              new Error("Received empty summary from AI service"), 
              { errorCode: "AI_SERVICE_ERROR" as ErrorCodeType }
            );
          }
          
          setSummary(data.summary);
          setOriginalContent(data.originalContent);
          setProgress(100);
        } catch (apiError: any) {
          console.error('Error processing URL with edge function:', apiError);
          throw apiError;
        }
      } catch (error: any) {
        console.error('Error in content processing:', error);
        
        // Create enhanced error object with error code if not already present
        const enhancedError = error.errorCode ? 
          error : 
          Object.assign(
            new Error(error.message || "Failed to process content"), 
            { errorCode: determineErrorCodeFromMessage(error.message) as ErrorCodeType }
          );
        
        setError(enhancedError);
        
        toast({
          title: getToastTitleForError(enhancedError.errorCode as ErrorCodeType),
          description: enhancedError.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    processContent();
  }, [url, style, bulletCount]);

  return { originalContent, summary, isLoading, error, progress };
};

// Helper function to determine error type based on message content
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

// Get user-friendly toast title based on error code
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
