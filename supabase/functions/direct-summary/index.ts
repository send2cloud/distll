import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { parseStyleFromPath } from "../process-url/services/styles/pathParser.ts";
import { processUrl } from "../process-url/services/contentProcessor.ts";
import { extractContentBetweenMarkers } from "../process-url/utils/text.ts";
import { corsHeaders } from "../process-url/utils/cors.ts";

// Cache duration in seconds (1 day)
const CACHE_DURATION = 86400;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the URL and path to extract style and target URL
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Received direct summary request for path: ${path}`);
    
    // Get the path without the leading slash
    let processPath = path.startsWith('/') ? path.substring(1) : path;
    
    if (!processPath) {
      throw new Error("No URL provided. Format should be /{style}/{url}");
    }
    
    console.log(`Processing path: ${processPath}`);
    
    // Parse the style from the path
    const { styleId, bulletCount, isBulletStyle } = parseStyleFromPath('/' + processPath);
    console.log(`Parsed style: ${styleId}, bulletCount: ${bulletCount}, isBulletStyle: ${isBulletStyle}`);
    
    // Extract the target URL from the path
    let targetUrl;
    
    if (styleId !== 'standard') {
      // For custom styles, remove the style prefix
      const stylePrefix = `${styleId}/`;
      const styleIndex = processPath.indexOf(stylePrefix);
      
      if (styleIndex !== -1) {
        targetUrl = processPath.substring(styleIndex + stylePrefix.length);
      } else if (isBulletStyle && bulletCount) {
        // For numeric bullet counts
        const bulletPrefix = `${bulletCount}/`;
        const bulletIndex = processPath.indexOf(bulletPrefix);
        
        if (bulletIndex !== -1) {
          targetUrl = processPath.substring(bulletIndex + bulletPrefix.length);
        }
      }
    } else {
      // For standard style, the entire path is the URL
      targetUrl = processPath;
    }
    
    // Handle case where targetUrl wasn't extracted properly
    if (!targetUrl) {
      // Fallback: treat everything after the style part as the URL
      const parts = processPath.split('/');
      if (parts.length > 1) {
        // Skip the first part (style) and join the rest as URL
        targetUrl = parts.slice(1).join('/');
      } else {
        throw new Error("Could not extract target URL from path. Please check format.");
      }
    }
    
    console.log(`Initial target URL extraction: ${targetUrl}`);
    
    // Decode the URL if needed
    try {
      targetUrl = decodeURIComponent(targetUrl);
    } catch (e) {
      console.log("URL decoding failed, using raw URL");
    }
    
    // Handle rewrite.page prefix if present
    if (targetUrl.includes('rewrite.page/')) {
      const matches = targetUrl.match(/rewrite\.page\/(\d+)?\/?(.+)/);
      if (matches && matches[2]) {
        targetUrl = matches[2];
      }
    }
    
    // Ensure URL has a protocol
    if (!targetUrl.match(/^[a-zA-Z]+:\/\//)) {
      targetUrl = 'https://' + targetUrl;
    }
    
    console.log(`Final processed target URL: ${targetUrl} with style: ${styleId}`);
    
    // Generate a cache key for this request
    const cacheKey = `${targetUrl}|${styleId}|${bulletCount || ''}|default-model`;
    
    // Process the URL to get the summary
    const model = "google/gemini-2.0-flash-lite-preview-02-05:free"; // Default model
    const result = await processUrl(targetUrl, styleId, bulletCount, model);
    
    // Clean up the summary for display
    const cleanedSummary = extractContentBetweenMarkers(result.summary);
    
    // Generate HTML response
    const html = generateHtmlResponse(cleanedSummary, styleId, targetUrl);
    
    // Return the HTML with appropriate headers
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
      'Surrogate-Control': `max-age=${CACHE_DURATION}`,
      'CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
      'Vercel-CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
      'Edge-Cache-Tag': `direct-${cacheKey.substring(0, 40)}` // Limit tag length
    };
    
    return new Response(html, { 
      headers: responseHeaders 
    });
    
  } catch (error) {
    console.error("Error in direct summary:", error);
    
    // Generate error HTML
    const errorHtml = generateErrorHtml(error.message);
    
    return new Response(errorHtml, { 
      status: 200, // Use 200 to ensure the error page is shown
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
});

/**
 * Generates an HTML page with the summary content
 */
function generateHtmlResponse(summary: string, style: string, originalUrl: string): string {
  const formattedStyle = style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, ' ');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formattedStyle} Summary | Distill</title>
  <meta name="description" content="Summary of ${originalUrl} in ${formattedStyle} style">
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap">
  <style>
    body {
      font-family: 'Noto Sans', sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background-color: #f7fafc;
    }
    .content {
      max-width: 36rem;
      margin: 0 auto;
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    p {
      margin-bottom: 1rem;
    }
    ul, ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    ul {
      list-style-type: disc;
    }
    ol {
      list-style-type: decimal;
    }
    blockquote {
      border-left: 4px solid #e2e8f0;
      padding-left: 1rem;
      font-style: italic;
      margin-bottom: 1rem;
    }
    .summary {
      white-space: pre-wrap;
    }
    .navbar {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }
    .header {
      text-align: center;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .footer {
      text-align: center;
      padding-top: 1rem;
      margin-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      font-size: 0.875rem;
      color: #718096;
    }
  </style>
</head>
<body>
  <div class="navbar bg-white shadow-sm">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <a href="/" class="text-gray-900 hover:text-blue-500">Distill</a>
      <div class="text-sm text-gray-600">${formattedStyle} Summary</div>
    </div>
  </div>

  <div class="container mx-auto py-6 px-4">
    <div class="content">
      <div class="header">
        <h1 class="text-xl font-bold">${formattedStyle} Summary</h1>
        <div class="text-sm text-gray-600 mt-1">
          <a href="${originalUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline">${originalUrl}</a>
        </div>
      </div>
      
      <div class="summary">
${renderMarkdown(summary)}
      </div>
      
      <div class="footer">
        Generated by <a href="https://distill.app" class="text-blue-600 hover:underline">Distill</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates an HTML error page
 */
function generateErrorHtml(errorMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error | Distill</title>
  <link rel="stylesheet" href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap">
  <style>
    body {
      font-family: 'Noto Sans', sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background-color: #f7fafc;
    }
    .error-container {
      max-width: 36rem;
      margin: 2rem auto;
      padding: 1.5rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
  </style>
</head>
<body>
  <div class="navbar bg-white shadow-sm">
    <div class="max-w-7xl mx-auto py-3 px-4">
      <a href="/" class="text-gray-900 hover:text-blue-500 font-semibold">Distill</a>
    </div>
  </div>

  <div class="container mx-auto py-6 px-4">
    <div class="error-container">
      <h1 class="text-xl font-bold text-red-600 mb-4">Error</h1>
      <p class="mb-4">${errorMessage}</p>
      <p class="text-gray-600">Please check your URL and try again.</p>
      <div class="mt-6">
        <a href="/" class="text-blue-600 hover:underline">Return to homepage</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Simple markdown rendering function
 */
function renderMarkdown(markdown: string): string {
  // This is a simplified markdown renderer
  // For production use, consider using a proper markdown library
  
  if (!markdown) return '';
  
  // Process markdown line by line
  return markdown
    .split('\n')
    .map(line => {
      // Handle headings
      if (line.match(/^#{1,6}\s/)) {
        const level = line.match(/^(#{1,6})\s/)[1].length;
        const text = line.replace(/^#{1,6}\s/, '');
        return `<h${level} class="text-${level === 1 ? 'xl' : level === 2 ? 'lg' : 'md'} font-bold">${text}</h${level}>`;
      }
      
      // Handle lists (very basic)
      if (line.match(/^(\d+\.|\*|\-)\s/)) {
        const text = line.replace(/^(\d+\.|\*|\-)\s/, '');
        return `<li>${text}</li>`;
      }
      
      // Handle paragraphs
      if (line.trim() !== '') {
        return `<p>${line}</p>`;
      }
      
      return '';
    })
    .join('\n')
    .replace(/<li>(.+?)<\/li>\n<li>/g, '<li>$1</li>\n<li>') // Group consecutive list items
    .replace(/(<li>.+?<\/li>\n)+/g, match => `<ul>\n${match}</ul>\n`) // Wrap lists in ul tags
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>'); // Links
}
