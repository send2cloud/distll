
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

export const invokeProcessFunction = async (params: ProcessUrlParams): Promise<ProcessUrlResponse> => {
  try {
    console.log("Invoking process-url function with params:", {
      ...params,
      apiKey: params.apiKey ? "PRESENT" : "NOT_PROVIDED" // Log whether API key is provided without exposing it
    });
    
    // Add retry logic for edge function calls
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.functions.invoke('process-url', {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (error) {
          console.error(`Supabase function error (attempt ${attempts + 1}):`, error);
          
          // Check if the error is related to project not found
          if (error.message && (
             error.message.includes('project not found') || 
             error.message.includes('could not find function') ||
             error.message.includes('404')
          )) {
            console.error('Project or function not found error. Check Supabase project configuration.');
            throw new Error('Service unavailable. Please check your connection and project configuration.');
          }
          
          lastError = error;
          attempts++;
          
          if (attempts < maxAttempts) {
            // Exponential backoff: 1s, 2s, 4s...
            const backoffTime = Math.pow(2, attempts - 1) * 1000;
            console.log(`Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          }
          
          throw error;
        }
        
        if (!data) {
          throw new Error("No data returned from function");
        }
        
        console.log("Function returned data:", data);
        
        // Check if the response contains an error message from the edge function
        if (data.error) {
          console.error("Edge function returned error:", data.error);
          const enhancedError = new Error(data.error);
          if (data.errorCode) {
            (enhancedError as any).errorCode = data.errorCode;
          }
          throw enhancedError;
        }
        
        return data as ProcessUrlResponse;
      } catch (retryError) {
        // If this is not our last attempt, continue to the next iteration
        if (attempts < maxAttempts) {
          lastError = retryError;
          attempts++;
          const backoffTime = Math.pow(2, attempts - 1) * 1000;
          console.log(`Request failed (attempt ${attempts}). Retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
        // On final attempt, rethrow the error
        throw retryError;
      }
    }
    
    // This should never be reached due to the throw in the loop, but TypeScript requires it
    throw lastError;
  } catch (error) {
    console.error("Error invoking process-url function:", error);
    
    // Add specific handling for project not found errors
    if (error instanceof Error && 
        (error.message.includes("project not found") || 
         error.message.includes("404") || 
         error.message.includes("could not find function"))) {
      console.error("Supabase project or function not found error. This might indicate the function doesn't exist or the project ID is incorrect.");
      throw new Error("Service unavailable. The server resources could not be found. If you're using a custom API key, please check your settings.");
    }
    
    throw error;
  }
};
