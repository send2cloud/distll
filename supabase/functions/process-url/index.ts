
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { processUrl, processDirectContent } from "./services/contentProcessor.ts";

// Cache duration in seconds (1 day)
const CACHE_DURATION = 86400;

// Generate a cache key based on request parameters
function generateCacheKey(url: string, content: string | undefined, style: string, bulletCount: number | undefined, model: string): string {
  return `${url || ''}|${content || ''}|${style}|${bulletCount || ''}|${model}`;
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
    
    const { url, content, style, bulletCount, model } = requestData;
    
    if (!url && !content) {
      throw new Error("Either URL or content parameter is required");
    }
    
    console.log(`Received request to process ${url ? 'URL: ' + url : 'direct content'} with style: ${style || 'standard'}, model: ${model || 'default'}`);
    
    // Generate a cache key for this specific request
    const cacheKey = generateCacheKey(
      url || '', 
      content, 
      style || 'standard',
      bulletCount,
      model || 'google/gemini-2.5-pro-exp-03-25:free'
    );
    
    let result;
    
    // Try to process the request and generate the response
    if (url) {
      result = await processUrl(url, style || 'standard', bulletCount, model);
    } else if (content) {
      // Process direct content if provided
      result = await processDirectContent(content, style || 'standard', bulletCount, model);
    }
    
    // Prepare the response with proper cache headers
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
      'Surrogate-Control': `max-age=${CACHE_DURATION}`,
      'CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
      'Vercel-CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
      'Edge-Cache-Tag': `rewrite-${cacheKey.substring(0, 40)}` // Limit tag length
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    
    // Create a user-friendly error message
    let userMessage = error.message || "An unknown error occurred";
    let errorCode = "PROCESSING_ERROR";
    
    // Categorize different error types
    if (userMessage.includes("URL")) {
      errorCode = "URL_ERROR";
    } else if (userMessage.includes("fetch") || userMessage.includes("connection") || userMessage.includes("timed out")) {
      errorCode = "CONNECTION_ERROR";
    } else if (userMessage.includes("content") || userMessage.includes("extract")) {
      errorCode = "CONTENT_ERROR";
    } else if (userMessage.includes("API") || userMessage.includes("quota") || userMessage.includes("rate limit")) {
      errorCode = "AI_SERVICE_ERROR";
    }
    
    // IMPORTANT: Return a 200 status with error in the body
    // This ensures our client code can properly process the error
    return new Response(
      JSON.stringify({
        error: userMessage,
        errorCode: errorCode,
        originalContent: "",
        summary: ""
      }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
});
