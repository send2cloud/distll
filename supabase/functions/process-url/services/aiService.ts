
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";
import { generatePrompt } from "./promptService.ts";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Set a reasonable timeout (in milliseconds)
const FETCH_TIMEOUT = 30000;

// Fallback API key - only used if environment variable is not set and no user key is provided
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
 * Summarize content directly by sending it to the OpenRouter API
 */
export async function summarizeContent(
  content: string,
  style: string = 'standard',
  bulletCount?: number,
  model: string = "google/gemma-3-4b-it",
  apiKey?: string
): Promise<string> {
  try {
    console.log(`Summarizing content with style: ${style}, bullet count: ${bulletCount}, model: ${model}`);
    
    // Generate the prompt for the model based on style
    const prompt = generatePrompt(content, style, bulletCount);
    
    return await callOpenRouterAPI(prompt, model, apiKey);
  } catch (error) {
    console.error(`Error in summarizeContent: ${error.message}`);
    throw error;
  }
}

/**
 * Summarize content from a Jina-proxied URL
 */
export async function summarizeWithJinaProxiedUrl(
  jinaProxyUrl: string,
  style: string = 'standard',
  bulletCount?: number,
  model: string = "google/gemma-3-4b-it",
  apiKey?: string
): Promise<string> {
  try {
    console.log(`Summarizing URL with style: ${style}, bullet count: ${bulletCount}, model: ${model}`);
    
    // Generate the prompt for the model
    const prompt = `Visit this URL: ${jinaProxyUrl}

Please read the content at this URL, then ${style === 'standard' ? 'summarize it' : 'rewrite it in ' + style + ' style'}${bulletCount ? ` with ${bulletCount} key points` : ''}.

If you can't access the URL content, say "I cannot access this URL." Do not make up a summary if you cannot access the content.`;
    
    console.log(`Attempting summarization with model: ${model}`);
    
    return await callOpenRouterAPI(prompt, model, apiKey);
  } catch (error) {
    console.error(`Error in summarizeWithJinaProxiedUrl: ${error.message}`);
    throw error;
  }
}

/**
 * Make a call to the OpenRouter API
 */
async function callOpenRouterAPI(
  prompt: string,
  model: string = "google/gemma-3-4b-it",
  apiKey?: string
): Promise<string> {
  try {
    // Try to get the API key in this priority order:
    // 1. User-provided API key from function parameter
    // 2. Environment variable (for production)
    // 3. Fallback hardcoded key (last resort)
    const openRouterApiKey = apiKey || Deno.env.get("OPENROUTER_API_KEY") || FALLBACK_API_KEY;
    
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is required but not provided");
    }
    
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
        throw new Error("API key is invalid or has expired. Please provide a valid OpenRouter API key in the settings.");
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
