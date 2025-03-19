
import { supabase } from "@/integrations/supabase/client";
import { createAppError } from "@/utils/errorUtils";
import { SummarizationStyle } from "@/components/SettingsModal";

/**
 * Edge Function response interface
 */
interface EdgeFunctionResponse {
  summary: string;
  originalContent: string;
  error?: string;
  errorCode?: string;
}

/**
 * Parameters for invoking the process-url edge function
 */
interface ProcessParams {
  url?: string;
  content?: string;
  style: SummarizationStyle;
  bulletCount?: number;
}

/**
 * Invokes the process-url edge function with the provided parameters
 * @param params Parameters to pass to the edge function
 * @returns Processed data from the edge function
 */
export const invokeProcessFunction = async (params: ProcessParams): Promise<EdgeFunctionResponse> => {
  try {
    // Ensure style is one of the accepted SummarizationStyle values, otherwise fall back to 'standard'
    const validStyle = Object.values(SummarizationStyle).includes(params.style as SummarizationStyle) 
      ? params.style 
      : 'standard' as SummarizationStyle;

    const { data, error } = await supabase.functions.invoke('process-url', {
      body: {
        ...params,
        style: validStyle
      }
    });
    
    // Handle edge function invocation errors (like network errors, not response errors)
    if (error) {
      console.error('Error calling process-url function:', error);
      throw createAppError(`Edge function error: ${error.message || "Unknown error"}`, "PROCESSING_ERROR");
    }
    
    if (!data) {
      throw createAppError("No data returned from edge function", "PROCESSING_ERROR");
    }
    
    // If the response contains an error property, it's an error
    if (data.error) {
      console.error('Error from edge function:', data.error, data.errorCode);
      throw createAppError(data.error, (data.errorCode || "PROCESSING_ERROR") as any);
    }
    
    return data as EdgeFunctionResponse;
  } catch (error) {
    // Add more detailed logging for troubleshooting
    console.error('Error in invokeProcessFunction:', error);
    
    // Re-throw the error to be handled by the calling code
    throw error;
  }
};
