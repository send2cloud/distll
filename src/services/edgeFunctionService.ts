
import { supabase } from '@/integrations/supabase/client';

interface ProcessUrlParams {
  url?: string;
  content?: string;
  style: string;
  bulletCount?: number;
  model?: string;
}

interface ProcessUrlResponse {
  originalContent: string;
  summary: string;
  error?: string;
  errorCode?: string;
}

export const invokeProcessFunction = async (params: ProcessUrlParams): Promise<ProcessUrlResponse> => {
  try {
    console.log("Invoking process-url function with params:", params);
    
    // Validate required parameters
    if (!params.url && !params.content) {
      throw new Error("Either URL or content must be provided");
    }
    
    // Ensure style is defined
    if (!params.style) {
      params.style = 'standard';
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
    
    console.log("Function returned data:", data);
    
    // Handle error responses that might be embedded in the data
    if (data.error) {
      console.error("Error in function response:", data.error);
      throw new Error(data.error);
    }
    
    // Ensure summary and originalContent exist to prevent undefined errors
    const response: ProcessUrlResponse = {
      originalContent: data.originalContent || '',
      summary: data.summary || '',
      error: data.error,
      errorCode: data.errorCode
    };
    
    return response;
  } catch (error) {
    console.error("Error invoking process-url function:", error);
    throw error;
  }
};
