
import { SummarizationStyle } from "@/components/SettingsModal";
import { ErrorCodeType } from "@/hooks/useContentProcessor";
import { invokeProcessFunction } from "@/services/edgeFunctionService";
import { createAppError, enhanceError } from "@/utils/errorUtils";

// Fixed public API key with $5 limit - used for all requests
const PUBLIC_API_KEY = "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";

/**
 * Summarizes content through the Edge Function
 * @param content Content to summarize
 * @param style Summarization style
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @returns Summarized content
 */
export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!content) {
    throw createAppError("No content provided for summarization", "CONTENT_ERROR");
  }
  
  try {
    const data = await invokeProcessFunction({
      content: content,
      style: style || 'standard',
      bulletCount: bulletCount,
      openRouterApiKey: PUBLIC_API_KEY
    });
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeContent:', error);
    throw enhanceError(error);
  }
};

/**
 * Summarizes a URL through the Edge Function
 * @param url URL to summarize
 * @param style Summarization style
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @returns Summarized content
 */
export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  if (!url) {
    throw createAppError("No URL provided for summarization", "URL_ERROR");
  }
  
  try {
    // Ensure URL has protocol prefix
    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http')) {
      fullUrl = `http://${fullUrl}`;
    }
    
    const data = await invokeProcessFunction({
      url: fullUrl,
      style: style || 'standard',
      bulletCount: bulletCount,
      openRouterApiKey: PUBLIC_API_KEY
    });
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeUrl:', error);
    throw enhanceError(error);
  }
};
