
import { AIModel } from '@/types/settings';
import { invokeProcessFunction } from "@/services/edgeFunctionService";
import { createAppError, enhanceError } from "@/utils/errorUtils";

/**
 * Summarizes content through the Edge Function
 * @param content Content to summarize
 * @param style Summarization style
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @param model AI model to use for summarization
 * @returns Summarized content
 */
export const summarizeContent = async (
  content: string, 
  style?: string, 
  bulletCount?: number,
  model?: AIModel
) => {
  if (!content) {
    throw createAppError("No content provided for summarization", "CONTENT_ERROR");
  }
  
  try {
    const data = await invokeProcessFunction({
      content: content,
      style: style || 'standard',
      bulletCount: bulletCount,
      model: model
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
 * @param model AI model to use for summarization
 * @returns Summarized content
 */
export const summarizeUrl = async (
  url: string, 
  style?: string, 
  bulletCount?: number,
  model?: AIModel
) => {
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
      model: model
    });
    
    return data.summary;
  } catch (error: any) {
    console.error('Error in summarizeUrl:', error);
    throw enhanceError(error);
  }
};
