import { supabase } from "@/integrations/supabase/client";
import { createAppError } from "@/utils/errorUtils";

interface ProcessFunctionParams {
  url?: string;
  content?: string;
  style: string;
  bulletCount?: number;
  model?: string;
}

export async function invokeProcessFunction(params: ProcessFunctionParams) {
  const { data, error } = await supabase.functions.invoke('process-url', {
    body: params
  });

  if (error) {
    throw createAppError(`Edge function error: ${error.message || "Unknown error"}`, "PROCESSING_ERROR");
  }

  if (!data) {
    throw createAppError("No data returned from edge function", "PROCESSING_ERROR");
  }

  if (data.error) {
    throw createAppError(data.error, (data.errorCode || "PROCESSING_ERROR") as any);
  }

  return data;
}
