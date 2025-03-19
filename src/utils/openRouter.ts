
// Direct OpenRouter integration with fixed API key
import { SummarizationStyle } from "@/components/SettingsModal";
import { supabase } from "@/integrations/supabase/client";
import { ErrorCodeType } from "@/hooks/useContentProcessor";

// Fixed public API key with $5 limit - used for all requests
const PUBLIC_API_KEY = "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";

// Process content through the Edge Function
export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!content) {
    throw Object.assign(
      new Error("No content provided for summarization"), 
      { errorCode: "CONTENT_ERROR" as ErrorCodeType }
    );
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('process-url', {
      body: {
        content: content,
        style: style || 'standard',
        bulletCount: bulletCount,
        openRouterApiKey: PUBLIC_API_KEY
      }
    });
    
    if (error) {
      console.error('Error calling process-url function for content:', error);
      throw Object.assign(
        new Error(`Edge function error: ${error.message || "Unknown error"}`),
        { errorCode: "PROCESSING_ERROR" as ErrorCodeType }
      );
    }
    
    if (!data) {
      throw Object.assign(
        new Error("No data returned from edge function"),
        { errorCode: "PROCESSING_ERROR" as ErrorCodeType }
      );
    }
    
    if (data.error) {
      throw Object.assign(
        new Error(data.error),
        { errorCode: (data.errorCode || "PROCESSING_ERROR") as ErrorCodeType }
      );
    }
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeContent:', error);
    
    if (!error.errorCode) {
      const errorCode = error.message.includes("content") ? "CONTENT_ERROR" :
                        error.message.includes("API") ? "AI_SERVICE_ERROR" :
                        "PROCESSING_ERROR";
      error.errorCode = errorCode as ErrorCodeType;
    }
    
    throw error;
  }
};

export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!url) {
    throw Object.assign(
      new Error("No URL provided for summarization"),
      { errorCode: "URL_ERROR" as ErrorCodeType }
    );
  }
  
  try {
    // Ensure URL has protocol prefix
    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http')) {
      fullUrl = `http://${fullUrl}`;
    }
    
    // We don't need to modify the URL here as the edge function now handles adding the Jina AI proxy
    
    const { data, error } = await supabase.functions.invoke('process-url', {
      body: {
        url: fullUrl,
        style: style || 'standard',
        bulletCount: bulletCount,
        openRouterApiKey: PUBLIC_API_KEY
      }
    });
    
    if (error) {
      console.error('Error calling process-url function for URL:', error);
      throw Object.assign(
        new Error(`Edge function error: ${error.message || "Unknown error"}`),
        { errorCode: "PROCESSING_ERROR" as ErrorCodeType }
      );
    }
    
    if (!data) {
      throw Object.assign(
        new Error("No data returned from edge function"),
        { errorCode: "PROCESSING_ERROR" as ErrorCodeType }
      );
    }
    
    if (data.error) {
      throw Object.assign(
        new Error(data.error),
        { errorCode: (data.errorCode || "PROCESSING_ERROR") as ErrorCodeType }
      );
    }
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeUrl:', error);
    
    if (!error.errorCode) {
      const errorCode = error.message.includes("URL") ? "URL_ERROR" :
                        error.message.includes("fetch") || error.message.includes("connection") ? "CONNECTION_ERROR" :
                        error.message.includes("content") ? "CONTENT_ERROR" :
                        error.message.includes("API") ? "AI_SERVICE_ERROR" :
                        "PROCESSING_ERROR";
      error.errorCode = errorCode as ErrorCodeType;
    }
    
    throw error;
  }
};
