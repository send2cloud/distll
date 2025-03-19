import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Fixed public API key with $5 limit that will be used for all requests
const PUBLIC_API_KEY = "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSummarizationPrompt(style: string, bulletCount?: number): string {
  // Base instruction to avoid preambles and postambles, now with instruction to output plain text
  const baseInstruction = "CRITICAL: Output ONLY plain text format. NO markdown. NO formatting. Do NOT include ANY introduction or conclusion. NO phrases like 'here's a summary', 'in summary', or 'here are the key points'. NO sign-offs like 'let me know if you need more information'. Start DIRECTLY with content. END immediately after content. Format your output with a ### START ### tag at the beginning and ### END ### tag at the end.";
  
  switch (style) {
    case 'simple':
      return `You are a helpful assistant that specializes in simplifying complex content. Your task is to rewrite the provided text in simple, easy-to-understand English with short sentences and common words. Avoid jargon and technical terms when possible. ${baseInstruction}`;
    
    case 'bullets':
      const count = bulletCount || 5;
      return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your task is to identify only the ${count} key takeaways. Present them as numbered bullet points (ex: 1. Point one). Make each point concise but informative. ${baseInstruction}`;
    
    case 'eli5':
      return `You are a helpful assistant that explains complex topics as if to a 5-year-old child. Use ONLY very simple language. Short sentences. Common words. Avoid ANY complex terms. Add line breaks between logical sections. Keep paragraphs to 2-3 simple sentences. Pretend the audience knows nothing about the topic. Start with a simple title line. ${baseInstruction}`;
    
    case 'concise':
      return `You are a helpful assistant that specializes in creating extremely concise summaries. Your task is to distill the content down to its absolute essence in as few words as possible while retaining all key information. Use short sentences and be very economical with language. ${baseInstruction}`;
    
    case 'tweet':
      return `You are a helpful assistant that specializes in creating tweet-sized summaries. Your task is to distill the content into exactly 140 characters or less. Be extremely concise while capturing the most essential point. Don't use hashtags unless they're crucial to the meaning. ${baseInstruction}`;
    
    case 'standard':
    default:
      return `You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your task is to identify the key information and present it in an easily digestible format. If content contains rankings or lists (like top 10), format them as proper numbered lists. ${baseInstruction}`;
  }
}

function extractContentBetweenMarkers(text: string, startMarker: string = 'START', endMarker: string = 'END'): string {
  if (!text) return '';
  
  // Try to find content between markers with various formats
  const patterns = [
    new RegExp(`#{1,3}\\s*${startMarker}\\s*#{1,3}([\\s\\S]*?)#{1,3}\\s*${endMarker}\\s*#{1,3}`, 'i'),
    new RegExp(`${startMarker}([\\s\\S]*?)${endMarker}`, 'i'),
    new RegExp(`\\b${startMarker}\\b\\s*([\\s\\S]*)`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim()) {
      return cleanTextFormatting(match[1]);
    }
  }
  
  // If no markers found, just clean the text
  return cleanTextFormatting(text);
}

function cleanTextFormatting(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove non-Latin script at the beginning
  cleaned = cleaned.replace(/^[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF]+[.,\s]*/g, '');
  
  // Remove any START or END tags in various formats
  cleaned = cleaned.replace(/#{1,3}\s*START\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/#{1,3}\s*END\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/\bSTART\b\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/\bEND\b\s*#{1,3}/gi, '');
  
  // Handle any START or END patterns without hashes
  cleaned = cleaned.replace(/^START\s+/gi, '');
  cleaned = cleaned.replace(/\s+END$/gi, '');
  
  // Remove any repeated START or END patterns in the middle of text
  cleaned = cleaned.replace(/\bSTART\b\s*/gi, '');
  cleaned = cleaned.replace(/\s*\bEND\b/gi, '');
  
  // Normalize bullet points for consistent formatting
  cleaned = cleaned
    .replace(/•\s*([^•\n]+)/g, '• $1\n')
    .replace(/•([^\s])/g, '• $1')
    .replace(/(\n\s*)•\s*/g, '$1  • ');
  
  // Clean up multiple consecutive line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

async function fetchContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    // Validate URL format before fetching
    try {
      new URL(url); // This will throw if URL is invalid
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
          'User-Agent': 'Mozilla/5.0 (compatible; DistillApp/1.0; +https://distill.app)'
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
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        console.log(`Warning: Content type is ${contentType}, which may not be HTML. Attempting extraction anyway.`);
      }
      
      const html = await response.text();
      
      if (!html || html.trim() === '') {
        throw new Error("Received empty content from URL. The page might be loading content dynamically with JavaScript.");
      }
      
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

async function summarizeContent(content: string, style: string, bulletCount?: number): Promise<string> {
  try {
    console.log(`Summarizing content with style: ${style}, bullet count: ${bulletCount}, content length: ${content.length} chars`);
    
    if (!content || content.trim().length < 100) {
      throw new Error("Content is too short to summarize meaningfully (less than 100 characters)");
    }
    
    // Implement retries for API calls
    const maxRetries = 2;
    let retries = 0;
    let summary = '';
    let lastError = null;
    
    while (retries <= maxRetries) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PUBLIC_API_KEY}`,
            "HTTP-Referer": "https://distill.app",
            "X-Title": "Distill"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-thinking-exp:free",
            messages: [
              {
                role: "system",
                content: getSummarizationPrompt(style, bulletCount)
              },
              {
                role: "user",
                content: `Summarize the following content according to the style specified in my system message. Remember: Start directly with content. No preamble. No postamble. PLAIN TEXT ONLY - NO MARKDOWN.\n\n${content}`
              }
            ],
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || `API error (${response.status}: ${response.statusText})`;
            
            // Special handling for specific OpenRouter errors
            if (errorMessage.includes("quota")) {
              throw new Error("AI provider quota exceeded. Please try again later or with a different summarization style.");
            }
            if (errorMessage.includes("rate limit")) {
              throw new Error("AI rate limit reached. Please try again in a few moments.");
            }
          } catch (e) {
            errorMessage = `AI provider error (${response.status}: ${response.statusText})`;
          }
          
          console.error(`OpenRouter API error (attempt ${retries + 1}/${maxRetries + 1}):`, errorMessage);
          lastError = new Error(errorMessage);
          
          if (retries >= maxRetries) {
            throw lastError;
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
          retries++;
          continue;
        }

        const data = await response.json();
        summary = data.choices[0].message.content;
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        if (retries >= maxRetries) {
          throw error; // Rethrow after all retries are exhausted
        }
        console.error(`API call failed (attempt ${retries + 1}/${maxRetries + 1}):`, error);
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        retries++;
      }
    }
    
    // Clean up preambles and other unwanted text
    summary = extractContentBetweenMarkers(summary);
    
    if (!summary || summary.trim().length < 10) {
      throw new Error("Failed to generate a meaningful summary. The AI model returned insufficient content.");
    }
    
    // Plain text cleanup for all styles
    summary = summary
      .replace(/\*\*/g, '')   // Remove bold markdown
      .replace(/\*/g, '')     // Remove italic markdown
      .replace(/#{1,6}\s/g, '') // Remove heading markers
      .replace(/\s+/g, ' ')   // Normalize multiple spaces
      .replace(/\n{3,}/g, '\n\n'); // Normalize excessive line breaks
    
    return summary;
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
}

async function processUrl(url: string, style: string, bulletCount?: number): Promise<{ originalContent: string; summary: string }> {
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
      // Create more user-friendly error messages
      if (fetchError.message.includes("ENOTFOUND") || fetchError.message.includes("getaddrinfo")) {
        throw new Error(`Could not resolve host: ${new URL(fullUrl).hostname}. Please check that the domain name is correct.`);
      } else if (fetchError.message.includes("ECONNREFUSED")) {
        throw new Error(`Connection refused by: ${new URL(fullUrl).hostname}. The website may be down or blocking our requests.`);
      } else {
        throw fetchError; // Rethrow original error if no specific handling
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed, please use POST`);
    }
    
    // Parse request body
    const requestData = await req.json().catch(e => {
      throw new Error("Invalid JSON in request body");
    });
    
    const { url, content, style, bulletCount } = requestData;
    
    if (!url && !content) {
      throw new Error("Either URL or content parameter is required");
    }
    
    console.log(`Received request to process ${url ? 'URL: ' + url : 'direct content'} with style: ${style || 'standard'}`);
    
    let result;
    if (url) {
      result = await processUrl(url, style || 'standard', bulletCount);
    } else if (content) {
      // Process direct content if provided
      const summary = await summarizeContent(content, style || 'standard', bulletCount);
      result = {
        originalContent: content,
        summary: summary
      };
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    
    // Create a user-friendly error message
    let userMessage = error.message || "An unknown error occurred";
    let errorCode = "PROCESSING_ERROR";
    
    // Categorize different error types
    if (userMessage.includes("URL")) {
      errorCode = "URL_ERROR";
    } else if (userMessage.includes("fetch") || userMessage.includes("ENOTFOUND") || userMessage.includes("ECONNREFUSED")) {
      errorCode = "CONNECTION_ERROR";
    } else if (userMessage.includes("content") || userMessage.includes("extract")) {
      errorCode = "CONTENT_ERROR";
    } else if (userMessage.includes("API") || userMessage.includes("quota") || userMessage.includes("rate limit")) {
      errorCode = "AI_SERVICE_ERROR";
    }
    
    return new Response(
      JSON.stringify({
        error: userMessage,
        errorCode: errorCode,
        originalContent: "",
        summary: ""
      }),
      { 
        status: 400, // Use 400 instead of 500 to indicate a client-side issue
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
