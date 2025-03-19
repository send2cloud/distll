
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { processUrl, processDirectContent } from "./services/contentProcessor.ts";

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
      result = await processDirectContent(content, style || 'standard', bulletCount);
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
