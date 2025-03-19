
// This file is kept for compatibility but its functionality has been moved to the Supabase Edge Function
import { getSettings } from "./settings";
import { SummarizationStyle } from "@/components/SettingsModal";
import { supabase } from "@/integrations/supabase/client";

// Default public API key with $5 limit - now used in the Edge Function
const PUBLIC_API_KEY = "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";

// These functions now call the Supabase Edge Function
export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!content) {
    throw Object.assign(
      new Error("No content provided for summarization"), 
      { errorCode: "CONTENT_ERROR" }
    );
  }
  
  try {
    const settings = getSettings();
    
    const { data, error } = await supabase.functions.invoke('process-url', {
      body: {
        content: content,
        style: style || 'standard',
        bulletCount: bulletCount,
        openRouterApiKey: settings.openRouterApiKey
      }
    });
    
    if (error) {
      console.error('Error calling process-url function for content:', error);
      throw Object.assign(
        new Error(`Edge function error: ${error.message || "Unknown error"}`),
        { errorCode: "PROCESSING_ERROR" }
      );
    }
    
    if (!data) {
      throw Object.assign(
        new Error("No data returned from edge function"),
        { errorCode: "PROCESSING_ERROR" }
      );
    }
    
    if (data.error) {
      throw Object.assign(
        new Error(data.error),
        { errorCode: data.errorCode || "PROCESSING_ERROR" }
      );
    }
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeContent:', error);
    
    // If error doesn't have an errorCode property, add one based on the message
    if (!error.errorCode) {
      error.errorCode = error.message.includes("content") ? "CONTENT_ERROR" :
                        error.message.includes("API") ? "AI_SERVICE_ERROR" :
                        "PROCESSING_ERROR";
    }
    
    throw error;
  }
};

export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!url) {
    throw Object.assign(
      new Error("No URL provided for summarization"),
      { errorCode: "URL_ERROR" }
    );
  }
  
  try {
    const settings = getSettings();
    
    const { data, error } = await supabase.functions.invoke('process-url', {
      body: {
        url: url,
        style: style || 'standard',
        bulletCount: bulletCount,
        openRouterApiKey: settings.openRouterApiKey
      }
    });
    
    if (error) {
      console.error('Error calling process-url function for URL:', error);
      throw Object.assign(
        new Error(`Edge function error: ${error.message || "Unknown error"}`),
        { errorCode: "PROCESSING_ERROR" }
      );
    }
    
    if (!data) {
      throw Object.assign(
        new Error("No data returned from edge function"),
        { errorCode: "PROCESSING_ERROR" }
      );
    }
    
    if (data.error) {
      throw Object.assign(
        new Error(data.error),
        { errorCode: data.errorCode || "PROCESSING_ERROR" }
      );
    }
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeUrl:', error);
    
    // If error doesn't have an errorCode property, add one based on the message
    if (!error.errorCode) {
      error.errorCode = error.message.includes("URL") ? "URL_ERROR" :
                        error.message.includes("fetch") || error.message.includes("connection") ? "CONNECTION_ERROR" :
                        error.message.includes("content") ? "CONTENT_ERROR" :
                        error.message.includes("API") ? "AI_SERVICE_ERROR" :
                        "PROCESSING_ERROR";
    }
    
    throw error;
  }
};
