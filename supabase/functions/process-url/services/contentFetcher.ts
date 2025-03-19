
/**
 * Service responsible for fetching content from URLs using Jina proxy
 */

/**
 * Fetches content from a URL through Jina proxy
 * @param url URL to fetch content from (should be a Jina proxy URL)
 * @returns Raw content from Jina proxy
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
      
      const content = await response.text();
      
      if (!content || content.trim() === '') {
        throw new Error("Received empty content from URL. The page might not have any meaningful text content.");
      }
      
      console.log(`Successfully fetched content (${content.length} chars)`);
      
      // Simply return the content as-is from the Jina proxy
      return content;
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
