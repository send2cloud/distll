
/**
 * Service responsible for fetching content from URLs
 */

import { extractContentBetweenMarkers } from "../utils/text.ts";

/**
 * Fetches content from a URL (primarily through Jina proxy)
 * @param url URL to fetch content from (should be a Jina proxy URL)
 * @returns Extracted text content
 */
export async function fetchContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    // Validate URL format before fetching
    let validatedUrl;
    try {
      validatedUrl = new URL(url);
      
      // Remove any fragments (anchors) as they can cause issues with some proxies
      validatedUrl.hash = '';
      url = validatedUrl.toString();
      
      console.log(`Validated URL: ${url}`);
    } catch (urlError) {
      throw new Error(`Invalid URL format: ${url}. Please ensure the URL includes the protocol (http:// or https://)`);
    }
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DistillApp/1.0; +https://distill.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const statusInfo = `${response.status} ${response.statusText}`;
        if (response.status === 403 || response.status === 401) {
          throw new Error(`Access denied (${statusInfo}). The website may be blocking our requests.`);
        } else if (response.status === 404) {
          throw new Error(`Page not found (${statusInfo}). Please check that the URL is correct.`);
        } else if (response.status >= 500) {
          throw new Error(`Website server error (${statusInfo}). The target website is experiencing issues.`);
        } else {
          throw new Error(`Failed to fetch content: ${statusInfo}`);
        }
      }
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        console.log(`Warning: Content type is ${contentType}, which may not be HTML. Attempting extraction anyway.`);
      }
      
      const htmlContent = await response.text();
      
      if (!htmlContent || htmlContent.trim() === '') {
        throw new Error("Received empty content from URL. The page might not have any meaningful text content.");
      }
      
      // Extract the main textual content from HTML
      const extractedContent = extractTextFromHTML(htmlContent);
      
      if (!extractedContent || extractedContent.trim().length < 200) {
        throw new Error("Could not extract meaningful content from the page. The content might be too short or restricted.");
      }
      
      console.log(`Successfully extracted ${extractedContent.length} chars of content`);
      
      return extractedContent;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error("Request timed out after 15 seconds. The website may be slow or unavailable.");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}

/**
 * Extracts the main textual content from HTML
 * @param html HTML content to extract text from
 * @returns Extracted text content
 */
function extractTextFromHTML(html: string): string {
  // First check if this is a Jina proxy response with a structured format
  // Jina typically returns the content in a specific format within the page
  
  try {
    // Look for structured content within a special div that Jina might use
    const contentMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (contentMatch && contentMatch[1]) {
      // Clean the extracted content from HTML tags
      let content = contentMatch[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&lt;/g, '<') // Replace &lt;
        .replace(/&gt;/g, '>') // Replace &gt;
        .replace(/&amp;/g, '&') // Replace &amp;
        .replace(/&quot;/g, '"') // Replace &quot;
        .replace(/\s+/g, ' '); // Normalize whitespace
      
      return content.trim();
    }
    
    // If we can't find a structured format, try a more aggressive approach
    // This is a fallback approach to extract meaningful text content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      // Extract text from body content
      let bodyContent = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '') // Remove header
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Remove footer
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '') // Remove navigation
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '') // Remove sidebars
        .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '') // Remove forms
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '') // Remove head
        .replace(/<[^>]*>/g, ' ') // Replace remaining tags with space
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&lt;/g, '<') // Replace &lt;
        .replace(/&gt;/g, '>') // Replace &gt;
        .replace(/&amp;/g, '&') // Replace &amp;
        .replace(/&quot;/g, '"') // Replace &quot;
        .replace(/\s+/g, ' '); // Normalize whitespace
        
      return bodyContent.trim();
    }
    
    // Final fallback: just strip all HTML tags and hope for the best
    let strippedContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ');
      
    return strippedContent.trim();
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    
    // Last resort: just return a cleaned version of the HTML
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
