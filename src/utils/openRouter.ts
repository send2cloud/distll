
// This file is kept for compatibility but its functionality has been moved to the Supabase Edge Function
import { getSettings } from "./settings";
import { SummarizationStyle } from "@/components/SettingsModal";
import { extractContentBetweenMarkers } from "./textFormatting";
import { supabase } from "@/integrations/supabase/client";

// Default public API key with $5 limit - now used in the Edge Function
const PUBLIC_API_KEY = "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";

// These functions now call the Supabase Edge Function
export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!content) {
    throw new Error("No content provided for summarization");
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
      throw new Error(`Edge function error: ${error.message || "Unknown error"}`);
    }
    
    if (!data) {
      throw new Error("No data returned from edge function");
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.summary;
  } catch (error) {
    console.error('Error in summarizeContent:', error);
    throw error;
  }
};

export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!url) {
    throw new Error("No URL provided for summarization");
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
      throw new Error(`Edge function error: ${error.message || "Unknown error"}`);
    }
    
    if (!data) {
      throw new Error("No data returned from edge function");
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.summary;
  } catch (error) {
    console.error('Error in summarizeUrl:', error);
    throw error;
  }
};
