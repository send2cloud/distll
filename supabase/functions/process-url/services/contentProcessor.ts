
import { summarizeWithJinaProxiedUrl, summarizeContent } from "./aiService.ts";

/**
 * Process a URL to directly summarize its content using Jina proxy + LLM
 * @param url URL to process
 * @param style Summarization style to use
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @param model OpenRouter model to use for summarization
 * @param apiKey Optional user-provided OpenRouter API key
 * @returns Object containing original and summarized content
 */
export async function processUrl(
  url: string, 
  style: string, 
  bulletCount?: number, 
  model: string = "google/gemma-3-4b-it",
  apiKey?: string
): Promise<{ originalContent: string; summary: string }> {
  try {
    // Normalize URL to ensure it has a proper protocol prefix
    let fullUrl = url.trim();
    
    if (!fullUrl) {
      throw new Error("URL is empty after trimming");
    }
    
    // Clean up style parameter (now we accept any style string)
    const normalizedStyle = style ? style.trim().toLowerCase() : 'standard';
    
    // For debugging - log what style we're using
    console.log(`Style requested: "${normalizedStyle}"`);
    
    // Ensure the URL has a protocol prefix
    if (!fullUrl.startsWith('http')) {
      fullUrl = `https://${fullUrl}`;
    }
    
    // Add Jina AI proxy prefix to the URL - this will be passed directly to the LLM
    const jinaProxyUrl = `https://r.jina.ai/${fullUrl}`;
    
    console.log(`Processing URL: ${fullUrl} with Jina proxy: ${jinaProxyUrl}, style: ${normalizedStyle}, model: ${model}, bullet count: ${bulletCount}`);
    
    // Pass the Jina-proxied URL directly to the LLM for content summarization
    const summary = await summarizeWithJinaProxiedUrl(jinaProxyUrl, normalizedStyle, bulletCount, model, apiKey);
    
    if (!summary || summary.trim().length === 0) {
      throw new Error("Generated summary is empty or invalid");
    }
    
    return {
      originalContent: `Content from: ${fullUrl}`, // Return a placeholder for original content
      summary: summary
    };
  } catch (error) {
    console.error("Error in processUrl:", error);
    throw error;
  }
}

/**
 * Process direct content to summarize it
 * @param content Content to summarize
 * @param style Summarization style to use
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @param model OpenRouter model to use for summarization
 * @param apiKey Optional user-provided OpenRouter API key
 * @returns Object containing original and summarized content
 */
export async function processDirectContent(
  content: string, 
  style: string, 
  bulletCount?: number,
  model: string = "google/gemma-3-4b-it",
  apiKey?: string
): Promise<{ originalContent: string; summary: string }> {
  try {
    // Normalize style (now we accept any style string)
    const normalizedStyle = style ? style.trim().toLowerCase() : 'standard';
    
    // For debugging - log what style we're using
    console.log(`Style requested for direct content: "${normalizedStyle}"`);
    
    if (!content || content.trim().length < 50) {
      throw new Error("Content is too short to summarize meaningfully (less than 50 characters)");
    }
    
    const summary = await summarizeContent(content, normalizedStyle, bulletCount, model, apiKey);
    
    if (!summary || summary.trim().length === 0) {
      throw new Error("Generated summary is empty or invalid");
    }
    
    return {
      originalContent: content,
      summary: summary
    };
  } catch (error) {
    console.error("Error in processDirectContent:", error);
    throw error;
  }
}
