
import { supabase } from '@/integrations/supabase/client';

interface ProcessUrlParams {
  url?: string;
  content?: string;
  style: string;
  bulletCount?: number;
  model?: string;
  apiKey?: string;
}

interface ProcessUrlResponse {
  originalContent: string;
  summary: string;
}

/**
 * Invokes the process-url edge function to summarize content
 * Follows the Single Responsibility Principle - this service only handles communication with the edge function
 */
export const invokeProcessFunction = async (params: ProcessUrlParams): Promise<ProcessUrlResponse> => {
  try {
    console.log("Invoking process-url function with params:", {
      url: params.url,
      content: params.content ? `${params.content.substring(0, 50)}... (${params.content.length} chars)` : undefined,
      style: params.style,
      bulletCount: params.bulletCount,
      model: params.model,
      apiKey: params.apiKey ? "PRESENT" : "NOT_PROVIDED" // Log whether API key is provided without exposing it
    });
    
    // Validate inputs before sending to edge function
    if (!params.url && !params.content) {
      throw new Error("Either URL or content must be provided");
    }
    
    if (params.style && params.style.length > 100) {
      throw new Error("Style parameter is too long (max 100 characters)");
    }
    
    const { data, error } = await supabase.functions.invoke('process-url', {
      method: 'POST',
      body: params
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("No data returned from function");
    }
    
    console.log("Function returned data summary length:", data.summary ? data.summary.length : 0);
    
    // Check if the response contains an error message from the edge function
    if (data.error) {
      console.error("Edge function returned error:", data.error);
      const enhancedError = new Error(data.error);
      if (data.errorCode) {
        (enhancedError as any).errorCode = data.errorCode;
      }
      throw enhancedError;
    }
    
    // Validate the returned data
    if (!data.summary || typeof data.summary !== 'string' || data.summary.trim().length === 0) {
      throw new Error("Edge function returned an empty or invalid summary");
    }
    
    return data as ProcessUrlResponse;
  } catch (error) {
    console.error("Error invoking process-url function:", error);
    throw error;
  }
};
