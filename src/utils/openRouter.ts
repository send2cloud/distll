
// This file is kept for compatibility but its functionality has been moved to the Supabase Edge Function
import { getSettings } from "./settings";
import { SummarizationStyle } from "@/components/SettingsModal";
import { extractContentBetweenMarkers } from "./textFormatting";

// Default public API key with $5 limit - now used in the Edge Function
const PUBLIC_API_KEY = "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";

// These functions are kept for backward compatibility
// but their implementation has been moved to Supabase Edge Functions
export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  throw new Error("This function has been moved to Supabase Edge Functions");
};

export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  throw new Error("This function has been moved to Supabase Edge Functions");
};
