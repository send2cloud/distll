
/**
 * Service responsible for fetching content from URLs
 */

/**
 * Fetches content from a URL
 * @param url URL to fetch content from
 * @returns Extracted text content
 */
export async function fetchContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    // Validate URL format before fetching
    let validatedUrl;
    try {
      validatedUrl = new URL(url); // This will throw if URL is invalid
      
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
      
      // Check content type to ensure we're processing HTML
      const contentType = response.headers.get('content-type') || '';
      console.log(`Content type: ${contentType}`);
      
      // More permissive content type check - some sites return unusual but valid content types
      if (!contentType.includes('text/html') && 
          !contentType.includes('application/xhtml+xml') && 
          !contentType.includes('application/xml') && 
          !contentType.includes('text/plain')) {
        console.log(`Warning: Content type is ${contentType}, which may not be HTML. Attempting extraction anyway.`);
      }
      
      const html = await response.text();
      
      if (!html || html.trim() === '') {
        throw new Error("Received empty content from URL. The page might be loading content dynamically with JavaScript.");
      }
      
      return extractMainContent(html);
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
 * Extracts the main content from HTML
 * @param html HTML content to extract from
 * @returns Extracted main content
 */
function extractMainContent(html: string): string {
  // Text-based extraction using regex patterns instead of DOMParser
  let mainContent = '';
  
  // First try to remove script, style tags and comments with regex
  let cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ');
  
  // Try to extract content from common article containers
  const articlePatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*?class="[^"]*?(?:content|article|post)[^"]*?"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*?id="[^"]*?(?:content|article|post)[^"]*?"[^>]*>([\s\S]*?)<\/div>/i
  ];
  
  for (const pattern of articlePatterns) {
    const match = cleanedHtml.match(pattern);
    if (match && match[1] && match[1].length > 500) {  // Ensure minimum content length
      mainContent = match[1];
      break;
    }
  }
  
  // If no article containers found, fallback to body content
  if (!mainContent) {
    const bodyMatch = cleanedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      mainContent = bodyMatch[1];
    }
  }
  
  // Strip remaining HTML tags and decode entities
  mainContent = mainContent
    .replace(/<[^>]*>/g, ' ')  // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')   // Replace non-breaking spaces
    .replace(/&lt;/g, '<')     // Decode common HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');     // Normalize whitespace
  
  // If no content extracted, use body text from the full HTML
  if (!mainContent || mainContent.trim().length < 500) {
    cleanedHtml = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    mainContent = cleanedHtml;
  }
  
  // Limit content length to prevent token issues
  const truncatedContent = mainContent.trim().substring(0, 15000);
  
  if (truncatedContent.length < 200) {
    throw new Error("Could not extract meaningful content from the page. The content might be loaded dynamically or restricted.");
  }
  
  console.log(`Successfully extracted ${truncatedContent.length} chars of content`);
  
  return truncatedContent;
}
