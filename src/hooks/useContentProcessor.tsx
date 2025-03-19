
import { useState, useEffect } from 'react';
import { getSettings } from '@/utils/settings';
import { SummarizationStyle } from '@/components/SettingsModal';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentProcessorResult {
  originalContent: string;
  summary: string;
  isLoading: boolean;
  error: Error & { errorCode?: string } | null;
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
  const [error, setError] = useState<Error & { errorCode?: string } | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setError(Object.assign(new Error("No URL provided"), { errorCode: "URL_ERROR" }));
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
        // Normalize URL to ensure it has a proper protocol prefix
        let decodedUrl = decodeURIComponent(url);
        decodedUrl = decodedUrl.trim();
        
        if (!decodedUrl) {
          throw Object.assign(new Error("URL is empty after decoding"), { errorCode: "URL_ERROR" });
        }
        
        // Ensure the URL has a protocol prefix
        const fullUrl = decodedUrl.startsWith('http') ? decodedUrl : `https://${decodedUrl}`;
        
        console.log("Processing URL:", fullUrl, "with style:", style, "and bullet count:", bulletCount);
        setProgress(20);
        
        const settings = getSettings();
        
        // Call the Supabase Edge Function to process the URL
        setProgress(40);
        
        // Add a timeout to detect long-running requests
        const timeoutDuration = 30000; // 30 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
        
        try {
          const { data, error } = await supabase.functions.invoke('process-url', {
            body: {
              url: fullUrl,
              style: style,
              bulletCount: bulletCount,
              openRouterApiKey: settings.openRouterApiKey
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (error) {
            console.error('Error calling process-url function:', error);
            // Handle specific error types based on the error message
            if (error.message?.includes('AbortError') || error.message?.includes('timeout')) {
              throw Object.assign(
                new Error("Request timed out after 30 seconds. The service might be experiencing high load or the website may be very large."), 
                { errorCode: "CONNECTION_ERROR" }
              );
            } else {
              throw Object.assign(
                new Error(`Edge function error: ${error.message || "Unknown error"}`),
                { errorCode: "PROCESSING_ERROR" }
              );
            }
          }
          
          if (!data) {
            throw Object.assign(
              new Error("No data returned from edge function"), 
              { errorCode: "PROCESSING_ERROR" }
            );
          }
          
          if (data.error) {
            // Use the error code if provided by the edge function
            throw Object.assign(
              new Error(data.error), 
              { errorCode: data.errorCode || "PROCESSING_ERROR" }
            );
          }
          
          setProgress(80);
          
          if (!data.summary || data.summary.trim() === '') {
            throw Object.assign(
              new Error("Received empty summary from AI service"), 
              { errorCode: "AI_SERVICE_ERROR" }
            );
          }
          
          setSummary(data.summary);
          setOriginalContent(data.originalContent);
          setProgress(100);
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          console.error('Error processing URL with edge function:', apiError);
          
          // If the error is an AbortError from our timeout
          if (apiError.name === 'AbortError') {
            throw Object.assign(
              new Error("The request took too long to complete. The website might be too large or our service is experiencing high load."),
              { errorCode: "CONNECTION_ERROR" }
            );
          }
          
          throw apiError;
        }
      } catch (error: any) {
        console.error('Error in content processing:', error);
        
        // Create enhanced error object with error code if not already present
        const enhancedError = error.errorCode ? 
          error : 
          Object.assign(
            new Error(error.message || "Failed to process content"), 
            { errorCode: determineErrorCodeFromMessage(error.message) }
          );
        
        setError(enhancedError);
        
        toast({
          title: getToastTitleForError(enhancedError.errorCode),
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
function determineErrorCodeFromMessage(message: string): string {
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
function getToastTitleForError(errorCode: string): string {
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
