
import { generatePrompt } from "./promptService.ts";

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Set a reasonable timeout (in milliseconds)
const FETCH_TIMEOUT = 30000;

// Hard-coded API key to avoid 401 errors - this is the correct key
const OPENROUTER_API_KEY = "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";

/**
 * Interface for AI service options following Interface Segregation Principle
 */
interface AiServiceOptions {
  content?: string;
  model?: string;
  style?: string;
  bulletCount?: number;
  apiKey?: string;
  jinaProxyUrl?: string;
}

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
    
    return await callOpenRouterAPI({
      content: prompt,
      model,
      apiKey
    });
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
    
    return await callOpenRouterAPI({
      content: prompt,
      model,
      apiKey
    });
  } catch (error) {
    console.error(`Error in summarizeWithJinaProxiedUrl: ${error.message}`);
    throw error;
  }
}

/**
 * Make a call to the OpenRouter API
 * Refactored to use an options object following Interface Segregation Principle
 */
async function callOpenRouterAPI(
  options: AiServiceOptions
): Promise<string> {
  try {
    const { content, model = "google/gemma-3-4b-it", apiKey } = options;
    
    // Use the provided API key or hardcoded key
    const openRouterApiKey = apiKey || OPENROUTER_API_KEY;
    
    // Ensure we have an API key
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is required but not provided");
    }
    
    // Log whether API key is present without revealing it
    console.log("Using API key:", openRouterApiKey ? "API key is present" : "No API key");
    console.log("Using model:", model);
    
    const payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 2048
    };
    
    console.log("Sending request to OpenRouter API");
    
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
      } else if (response.status === 401) {
        console.error("Authentication error with OpenRouter API. Check API key validity.");
        throw new Error(`OpenRouter API authentication error. Please try again with a valid API key.`);
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
