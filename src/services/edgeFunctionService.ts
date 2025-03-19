
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
  openRouterApiKey: string;
}

/**
 * Invokes the process-url edge function with the provided parameters
 * @param params Parameters to pass to the edge function
 * @returns Processed data from the edge function
 */
export const invokeProcessFunction = async (params: ProcessParams): Promise<EdgeFunctionResponse> => {
  const { data, error } = await supabase.functions.invoke('process-url', {
    body: params
  });
  
  if (error) {
    console.error('Error calling process-url function:', error);
    throw createAppError(`Edge function error: ${error.message || "Unknown error"}`, "PROCESSING_ERROR");
  }
  
  if (!data) {
    throw createAppError("No data returned from edge function", "PROCESSING_ERROR");
  }
  
  if (data.error) {
    throw createAppError(data.error, (data.errorCode || "PROCESSING_ERROR") as any);
  }
  
  return data as EdgeFunctionResponse;
};
