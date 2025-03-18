
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const PUBLIC_API_KEY = "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSummarizationPrompt(style: string, bulletCount?: number): string {
  // Base instruction to avoid preambles and postambles
  const baseInstruction = "CRITICAL: Do NOT include ANY introduction or conclusion. NO phrases like 'here's a summary', 'in summary', or 'here are the key points'. NO sign-offs like 'let me know if you need more information'. Start DIRECTLY with content. END immediately after content. Any preamble or postamble will result in rejection. Format your output with a ### START ### tag at the beginning and ### END ### tag at the end.";
  
  switch (style) {
    case 'simple':
      return `You are a helpful assistant that specializes in simplifying complex content. Your task is to rewrite the provided text in simple, easy-to-understand English with short sentences and common words. Avoid jargon and technical terms when possible. Format your output in markdown with appropriate headings and lists. ${baseInstruction}`;
    
    case 'bullets':
      const count = bulletCount || 5;
      return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your task is to identify only the ${count} key takeaways and present them as a numbered list in markdown format. Make each point concise but informative. ${baseInstruction}`;
    
    case 'eli5':
      return `You are a helpful assistant that specializes in explaining complex topics in simple terms. Your task is to use very simple language, basic analogies, and avoid technical terms. Break down complicated ideas into easily digestible concepts. Format your explanation in markdown with appropriate headings and emphasis where needed. ${baseInstruction}`;
    
    case 'concise':
      return `You are a helpful assistant that specializes in creating extremely concise summaries. Your task is to distill the content down to its absolute essence in as few words as possible while retaining all key information. Use short sentences and be very economical with language. Format your response in markdown. ${baseInstruction}`;
    
    case 'tweet':
      return `You are a helpful assistant that specializes in creating tweet-sized summaries. Your task is to distill the content into exactly 140 characters or less. Be extremely concise while capturing the most essential point. Don't use hashtags unless they're crucial to the meaning. ${baseInstruction}`;
    
    case 'standard':
    default:
      return `You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your task is to identify the key information and present it in an easily digestible format. Always write your summary in markdown format. Use appropriate formatting like lists, headers, and bold text. If content contains rankings or lists (like top 10), format them as proper numbered lists. ${baseInstruction}`;
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

// Simple text-based content extraction without using DOMParser
async function fetchContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
    
    // Check content type to ensure we're processing HTML
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      console.log(`Note: Content type is ${contentType}, which may not be HTML`);
      // Continue anyway as some servers might not set the correct content type
    }
    
    const html = await response.text();
    
    if (!html || html.trim() === '') {
      throw new Error("Received empty content from URL");
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
    
    console.log(`Successfully extracted ${truncatedContent.length} chars of content`);
    
    return truncatedContent;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}

async function summarizeContent(content: string, style: string, bulletCount?: number, apiKey: string = PUBLIC_API_KEY): Promise<string> {
  try {
    console.log(`Summarizing content with style: ${style}, bullet count: ${bulletCount}, content length: ${content.length} chars`);
    
    if (!content || content.trim().length < 100) {
      throw new Error("Content is too short to summarize meaningfully (less than 100 characters)");
    }
    
    // Implement retries for API calls
    const maxRetries = 2;
    let retries = 0;
    let summary = '';
    
    while (retries <= maxRetries) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://distill.app",
            "X-Title": "Distill"
          },
          body: JSON.stringify({
            model: "google/gemma-3-1b-it:free",
            messages: [
              {
                role: "system",
                content: getSummarizationPrompt(style, bulletCount)
              },
              {
                role: "user",
                content: `Summarize the following content according to the style specified in my system message. Remember: Start directly with content. No preamble. No postamble.\n\n${content}`
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
          } catch (e) {
            errorMessage = `API error (${response.status}: ${response.statusText})`;
          }
          
          console.error(`OpenRouter API error (attempt ${retries + 1}/${maxRetries + 1}):`, errorMessage);
          
          if (retries >= maxRetries) {
            throw new Error(errorMessage);
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
      throw new Error("Failed to generate a meaningful summary");
    }
    
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
    fullUrl = fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`;
    
    console.log(`Processing URL: ${fullUrl} with style: ${style}, bullet count: ${bulletCount}`);
    
    const content = await fetchContent(fullUrl);
    
    if (!content || content.trim() === '') {
      throw new Error("Content was empty after fetching and processing");
    }
    
    console.log(`Successfully fetched content (${content.length} chars), summarizing...`);
    
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
    const { url, style, bulletCount, openRouterApiKey } = await req.json();
    
    if (!url) {
      throw new Error("URL parameter is required");
    }
    
    console.log(`Received request to process URL: ${url} with style: ${style}`);
    
    // Use provided API key or fallback to public key
    const apiKey = openRouterApiKey || PUBLIC_API_KEY;
    
    const result = await processUrl(url, style || 'standard', bulletCount);
    
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
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unknown error occurred",
        originalContent: "",
        summary: ""
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
