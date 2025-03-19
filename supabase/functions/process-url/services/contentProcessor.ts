
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
      fullUrl = `http://${fullUrl}`;
    }
    
    // Add Jina AI proxy prefix to the URL
    const jinaProxyUrl = `https://r.jina.ai/${fullUrl}`;
    
    console.log(`Processing URL: ${fullUrl} with Jina proxy: ${jinaProxyUrl}, style: ${style}, bullet count: ${bulletCount}`);
    
    let content: string;
    try {
      // Use the Jina proxy URL for fetching content
      content = await fetchContent(jinaProxyUrl);
    } catch (fetchError) {
      console.error("Error with Jina proxy, trying direct URL as fallback:", fetchError);
      
      try {
        // Try direct URL as fallback
        content = await fetchContent(fullUrl);
        console.log("Direct URL fetch successful as fallback");
      } catch (directFetchError) {
        // Create more user-friendly error messages
        if (directFetchError.message.includes("ENOTFOUND") || directFetchError.message.includes("getaddrinfo")) {
          throw new Error(`Could not resolve host: ${new URL(fullUrl).hostname}. Please check that the domain name is correct.`);
        } else if (directFetchError.message.includes("ECONNREFUSED")) {
          throw new Error(`Connection refused by: ${new URL(fullUrl).hostname}. The website may be down or blocking our requests.`);
        } else {
          throw directFetchError; // Rethrow original error if no specific handling
        }
      }
    }
    
    if (!content || content.trim() === '') {
      throw new Error("Content was empty after fetching and processing. The website may use techniques that prevent content extraction.");
    }
    
    console.log(`Successfully fetched content (${content.length} chars), summarizing...`);
    
    let summary: string;
    try {
      summary = await summarizeContent(content, style, bulletCount);
    } catch (summaryError) {
      if (summaryError.message.includes("too short")) {
        throw new Error("The extracted content is too short to summarize meaningfully. Please try a different URL with more text content.");
      } else {
        throw summaryError; // Rethrow original error
      }
    }
    
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
