
import { fetchContent } from "./contentFetcher.ts";
import { summarizeContent } from "./aiService.ts";

/**
 * Process a URL to fetch and summarize its content
 * @param url URL to process
 * @param style Summarization style to use
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @returns Object containing original and summarized content
 */
export async function processUrl(url: string, style: string, bulletCount?: number): Promise<{ originalContent: string; summary: string }> {
  try {
    // Normalize URL to ensure it has a proper protocol prefix
    let fullUrl = url.trim();
    
    if (!fullUrl) {
      throw new Error("URL is empty after trimming");
    }
    
    // Ensure the URL has a protocol prefix
    if (!fullUrl.startsWith('http')) {
      fullUrl = `https://${fullUrl}`;
    }
    
    // Add Jina AI proxy prefix to the URL
    const jinaProxyUrl = `https://r.jina.ai/${fullUrl}`;
    
    console.log(`Processing URL: ${fullUrl} with Jina proxy: ${jinaProxyUrl}, style: ${style}, bullet count: ${bulletCount}`);
    
    // Get content from Jina proxy - we're not doing any HTML extraction as Jina gives us clean content
    const content = await fetchContent(jinaProxyUrl);
    
    if (!content || content.trim() === '') {
      throw new Error("Content was empty after fetching. The website may use techniques that prevent content extraction.");
    }
    
    console.log(`Successfully fetched content (${content.length} chars), summarizing...`);
    
    // Pass the content directly to OpenRouter for summarization
    const summary = await summarizeContent(content, style, bulletCount);
    
    return {
      originalContent: content,
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
 * @returns Object containing original and summarized content
 */
export async function processDirectContent(content: string, style: string, bulletCount?: number): Promise<{ originalContent: string; summary: string }> {
  try {
    if (!content || content.trim() === '') {
      throw new Error("Content is empty after processing");
    }
    
    console.log(`Processing direct content (${content.length} chars), style: ${style}`);
    
    const summary = await summarizeContent(content, style || 'standard', bulletCount);
    
    return {
      originalContent: content,
      summary: summary
    };
  } catch (error) {
    console.error("Error in processDirectContent:", error);
    throw error;
  }
}
