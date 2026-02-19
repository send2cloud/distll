import { supabase } from "@/integrations/supabase/client";
import { SummarizationService, SummarizationRequest, SummarizationResponse } from "@/core/summarization/types";
import { createAppError } from "@/utils/errorUtils";

export class SupabaseSummarizationAdapter implements SummarizationService {
    async process(params: SummarizationRequest): Promise<SummarizationResponse> {
        try {
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
                console.error('Error from edge function:', data.error, data.errorCode);
                throw createAppError(data.error, (data.errorCode || "PROCESSING_ERROR") as any);
            }

            return {
                summary: data.summary,
                originalContent: data.originalContent
            };
        } catch (error) {
            console.error('Error in SupabaseSummarizationAdapter:', error);
            throw error;
        }
    }
}
