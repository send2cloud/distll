
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { extractContentBetweenMarkers } from "./utils/text.ts";
import { corsHeaders } from "./utils/cors.ts";

// Cache duration in seconds (1 day)
const CACHE_DURATION = 86400;

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Set a reasonable timeout (in milliseconds)
const FETCH_TIMEOUT = 30000;

// Fallback API key - only used if environment variable is not set
const FALLBACK_API_KEY = "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";

/**
 * Creates a fetch request with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  
  return response;
}

/**
 * Extract style and URL information from a path
 */
function parsePathInfo(path: string): { 
  styleId: string, 
  targetUrl: string,
  bulletCount?: number 
} {
  console.log(`Parsing path info: ${path}`);
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Check for bullet point number in URL path (e.g., /5/)
  const bulletMatch = cleanPath.match(/^(\d+)(?:\/|$)/);
  if (bulletMatch) {
    const bulletCount = parseInt(bulletMatch[1], 10);
    // Extract the URL which comes after the bullet count and slash
    const urlPart = cleanPath.substring(bulletMatch[0].length);
    return { 
      styleId: 'bullets', 
      bulletCount,
      targetUrl: urlPart
    };
  }
  
  // Check for custom style modifier (e.g., /seinfeld-standup/)
  const customStyleMatch = cleanPath.match(/^([a-zA-Z0-9_-]+)(?:\/|$)/);
  if (customStyleMatch) {
    const styleId = customStyleMatch[1].toLowerCase();
    // Extract the URL which comes after the style and slash
    const urlPart = cleanPath.substring(customStyleMatch[0].length);
    
    // Special case: if the style is "bullets" without a count, default to 5 bullets
    if (styleId === 'bullets') {
      return { 
        styleId, 
        bulletCount: 5,
        targetUrl: urlPart
      };
    }
    
    return { 
      styleId,
      targetUrl: urlPart
    };
  }
  
  // If no style/bullet info, the whole path is the URL
  return { 
    styleId: 'standard',
    targetUrl: cleanPath
  };
}

/**
 * Normalize a style ID for consistent handling
 */
function normalizeStyleId(styleId: string): string {
  if (!styleId) return 'standard';
  
  const normalized = styleId.toLowerCase().trim();
  
  // Handle special cases and aliases
  const styleAliases: Record<string, string> = {
    'bullet': 'bullets',
    'bulletpoint': 'bullets',
    'bulletpoints': 'bullets',
    'bullet-point': 'bullets',
    'bullet-points': 'bullets',
    'eli': 'eli5',
    'eli-5': 'eli5',
    'explainlikeimfive': 'eli5',
    'explain-like-im-five': 'eli5',
    'seinfeld': 'seinfeld-standup',
    'jerry': 'seinfeld-standup',
    'jerryseinfeld': 'seinfeld-standup',
    'jerry-seinfeld': 'seinfeld-standup',
    'pirate': 'piratetalk',
    'piratesp': 'piratetalk',
    'pirates': 'piratetalk',
    'click': 'clickbait',
    'clickbaity': 'clickbait'
  };
  
  return styleAliases[normalized] || normalized;
}

/**
 * Make a call to the OpenRouter API
 */
async function callOpenRouterAPI(
  prompt: string,
  model: string = "google/gemma-3-4b-it"
): Promise<string> {
  try {
    // Use the environment variable for API key or fall back to the default
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY") || FALLBACK_API_KEY;
    
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is required but not provided");
    }
    
    console.log("Using API key starting with:", openRouterApiKey.substring(0, 5) + "...");
    
    const payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2048
    };
    
    const response = await fetchWithTimeout(
      OPENROUTER_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://rewrite.page",
          "X-Title": "Rewrite.page"
        },
        body: JSON.stringify(payload)
      },
      FETCH_TIMEOUT
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      if (response.status === 429) {
        throw new Error("OpenRouter API rate limit reached. The free tier quota has been exceeded. Please try again later or provide your own API key in the settings.");
      }
      if (response.status === 401) {
        throw new Error("API key is invalid or expired. Please provide a valid OpenRouter API key in the settings.");
      }
      throw new Error(`OpenRouter API error: ${data.error?.message || JSON.stringify(data)}`);
    }
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter API");
    }
    
    const generatedText = data.choices[0].message.content.trim();
    
    if (!generatedText) {
      throw new Error("OpenRouter API returned empty content");
    }
    
    console.log(`Received response of length: ${generatedText.length}`);
    
    return generatedText;
  } catch (error) {
    console.error(`Error in callOpenRouterAPI: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a prompt with style instructions
 */
function generateStylePrompt(style: string, jinaProxyUrl: string, bulletCount?: number): string {
  // Base prompt with style examples
  const styleExamples = `
Here are some examples of how different styles should be interpreted:
- "eli5": Explain like I'm 5 years old, using simple words and concepts a child would understand
- "top10": Create a numbered list of the 10 most important points in decreasing order of importance
- "bullet-points": Present the key information as a clear, concise bulleted list
- "todo-list": Transform the content into a practical checklist of action items with checkboxes
- "seinfeld-standup": Rewrite as if Jerry Seinfeld was doing a comedy routine about this topic
- "piratetalk": Use pirate language, phrases and terminology throughout
- "haiku": Create beautiful haiku poems that capture the essence of the content
- "clickbait": Use exaggerated, attention-grabbing headlines and phrasings
- "fantasy": Add magical elements and epic storytelling techniques
- "tldr": Give an extremely concise "too long; didn't read" summary`;

  // Create the prompt for the model
  let prompt = `Visit this URL: ${jinaProxyUrl}

Please read the content at this URL, then ${style === 'standard' ? 'summarize it' : 'rewrite it in ' + style + ' style'}${bulletCount ? ` with ${bulletCount} key points` : ''}.

${styleExamples}

If the style doesn't match any of these examples, use your creativity to match the requested style as closely as possible.

If you can't access the URL content, say "I cannot access this URL." Do not make up a summary if you cannot access the content.`;

  return prompt;
}

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
  <title>${formattedStyle} Summary | Rewrite.page</title>
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
      <a href="/" class="text-gray-900 hover:text-blue-500">Rewrite.page</a>
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
        Generated by <a href="https://rewrite.page" class="text-blue-600 hover:underline">Rewrite.page</a>
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
  <title>Error | Rewrite.page</title>
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
      <a href="/" class="text-gray-900 hover:text-blue-500 font-semibold">Rewrite.page</a>
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
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rewrite.page</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css">
            <meta http-equiv="refresh" content="0;url=/">
          </head>
          <body class="bg-gray-50 text-gray-800">
            <div class="container mx-auto px-4 py-8 max-w-3xl">
              <h1 class="text-2xl font-bold mb-4">Redirecting...</h1>
              <p class="mb-4">Redirecting to homepage.</p>
            </div>
          </body>
        </html>
      `, {
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
