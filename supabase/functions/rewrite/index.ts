
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { extractContentBetweenMarkers } from "./utils/text.ts";
import { parsePathInfo, normalizeUrl, normalizeStyleId } from "./services/urlParser.ts";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Set a reasonable timeout (in milliseconds)
const FETCH_TIMEOUT = 30000;

// Cache duration in seconds (1 day)
const CACHE_DURATION = 86400;

// Hard-coded API key to avoid 401 errors
const OPENROUTER_API_KEY = "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";

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
 * Make a call to the OpenRouter API
 */
async function callOpenRouterAPI(
  prompt: string,
  model: string = "google/gemma-3-4b-it"
): Promise<string> {
  try {
    console.log("Calling OpenRouter API with prompt length:", prompt.length);
    console.log("Using model:", model);
    
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
    
    // Log API key presence without revealing it
    console.log("Using API key:", OPENROUTER_API_KEY ? "API key is present" : "No API key");
    
    const response = await fetchWithTimeout(
      OPENROUTER_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
      } else if (response.status === 401) {
        console.error("Authentication error with OpenRouter API. Check API key validity.");
        throw new Error(`OpenRouter API authentication error. Please check your API key.`);
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
    
    // Normalize the target URL
    const processedUrl = normalizeUrl(targetUrl);
    
    console.log(`Processing with style: ${styleId}, bullet count: ${bulletCount}, URL: ${processedUrl}`);
    
    // Create the Jina proxy URL
    const jinaProxyUrl = `https://r.jina.ai/${processedUrl}`;
    console.log(`Using Jina proxy URL: ${jinaProxyUrl}`);
    
    // Generate prompt for OpenRouter
    const prompt = generateStylePrompt(styleId, jinaProxyUrl, bulletCount);
    
    // Call OpenRouter API with the prompt
    const summary = await callOpenRouterAPI(prompt, 'google/gemma-3-4b-it');
    
    // Create an HTML response
    const cleanedSummary = extractContentBetweenMarkers(summary);
    const html = generateHtmlResponse(cleanedSummary, styleId, processedUrl);
    
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
