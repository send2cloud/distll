
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
}

export const invokeProcessFunction = async (params: ProcessUrlParams): Promise<ProcessUrlResponse> => {
  try {
    console.log("Invoking process-url function with params:", params);
    
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
    
    return data as ProcessUrlResponse;
  } catch (error) {
    console.error("Error invoking process-url function:", error);
    throw error;
  }
};
