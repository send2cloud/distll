
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { extractContentBetweenMarkers } from "./utils/text.ts";
import { corsHeaders } from "./utils/cors.ts";
import { parsePathInfo, normalizeStyleId } from "./services/styleService.ts";
import { generateStylePrompt, callOpenRouterAPI } from "./services/aiService.ts";
import { generateHtmlResponse, generateErrorHtml } from "./services/renderService.ts";
import { CACHE_DURATION, LANDING_PAGE_HTML } from "./utils/constants.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Received request for path: ${path}`);
    
    // Return a simple landing page for root requests
    if (path === '/' || path === '') {
      return new Response(LANDING_PAGE_HTML, {
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
    
    // Parse path and extract style and URL
    const { styleId, targetUrl, bulletCount } = parsePathInfo(path);
    
    if (!targetUrl) {
      throw new Error("No URL provided in the path");
    }
    
    // Normalize style
    const normalizedStyle = normalizeStyleId(styleId);
    
    console.log(`Processing with style: ${normalizedStyle}, bullet count: ${bulletCount}, URL: ${targetUrl}`);
    
    // Process the URL to get the summary
    let processedUrl = targetUrl;
    if (!processedUrl.match(/^[a-zA-Z]+:\/\//)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    // Create the Jina proxy URL
    const jinaProxyUrl = `https://r.jina.ai/${processedUrl}`;
    
    // Generate prompt for OpenRouter
    const prompt = generateStylePrompt(normalizedStyle, jinaProxyUrl, bulletCount);
    
    // Call OpenRouter API with the prompt
    const summary = await callOpenRouterAPI(prompt, 'google/gemma-3-4b-it');
    
    // Create an HTML response
    const cleanedSummary = extractContentBetweenMarkers(summary);
    const html = generateHtmlResponse(cleanedSummary, normalizedStyle, processedUrl);
    
    // Return the HTML with appropriate headers
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
    };
    
    return new Response(html, { 
      headers: responseHeaders 
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Return HTML error page
    const errorHtml = generateErrorHtml(error.message);
    return new Response(
      errorHtml,
      { 
        status: 200, // Using 200 to ensure the error page is shown
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
});
