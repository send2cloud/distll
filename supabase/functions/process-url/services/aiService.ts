
import { extractContentBetweenMarkers } from "../utils/text.ts";
import { SummarizationPromptFactory } from "./promptService.ts";

// Fixed public API key with $5 limit that will be used for all requests
const PUBLIC_API_KEY = "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";

// Define fallback model to use when the primary model fails
const FALLBACK_MODEL = "anthropic/claude-3-haiku-20240307";

/**
 * Summarizes content using an AI model with a direct Jina-proxied URL
 * @param jinaProxyUrl The Jina-proxied URL to summarize
 * @param style Summarization style to use
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @param model OpenRouter model to use for summarization
 * @returns Summarized content
 */
export async function summarizeWithJinaProxiedUrl(
  jinaProxyUrl: string,
  style: string,
  bulletCount?: number,
  model: string = "google/gemini-2.0-flash-thinking-exp:free"
): Promise<string> {
  try {
    console.log(`Summarizing URL with style: ${style}, bullet count: ${bulletCount}, model: ${model}`);

    // Single retry for API calls
    let retries = 0;
    const maxRetries = 1;
    let currentModel = model;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Attempting summarization with model: ${currentModel}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PUBLIC_API_KEY}`,
            "HTTP-Referer": "https://distill.app",
            "X-Title": "Distill"
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              {
                role: "system",
                content: SummarizationPromptFactory.getPrompt(style, bulletCount)
              },
              {
                role: "user",
                content: `Visit this URL and summarize the content according to the style specified in my system message. Remember: Start directly with content. No preamble. No postamble. PLAIN TEXT ONLY - NO MARKDOWN.\n\nURL: ${jinaProxyUrl}`
              }
            ],
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `API error (${response.status}: ${response.statusText})`;
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            }
            
            // Check if error is rate limit related
            const isRateLimitError = 
              errorMessage.includes("quota") || 
              errorMessage.includes("rate limit") || 
              errorMessage.includes("capacity") ||
              errorMessage.includes("429") ||
              response.status === 429;
            
            // If it's a rate limit error and we have retries left, try with fallback model
            if (isRateLimitError && retries < maxRetries && currentModel !== FALLBACK_MODEL) {
              console.log(`Rate limit error with model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
              currentModel = FALLBACK_MODEL;
              retries++;
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } catch (e) {
            // If we can't parse the error, use the default message
            console.error("Error parsing API error response:", e);
          }
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Retrying after error: ${errorMessage} with fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Add defensive check for data.choices being undefined or empty
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error("Invalid API response structure:", JSON.stringify(data, null, 2));
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Invalid response from model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error("Invalid response from OpenRouter API - missing or empty choices array");
        }
        
        // Add defensive check for message content
        if (!data.choices[0].message || !data.choices[0].message.content) {
          console.error("Invalid message structure in response:", JSON.stringify(data.choices[0], null, 2));
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Missing content from model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error("Invalid response structure - missing message content");
        }
        
        const summary = data.choices[0].message.content;
        
        // Simple cleanup - no complex processing
        const cleanedSummary = extractContentBetweenMarkers(summary);
        
        if (!cleanedSummary || cleanedSummary.trim().length < 10) {
          console.error("Generated summary is too short or empty:", cleanedSummary);
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Empty summary from model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error("Failed to generate a meaningful summary");
        }
        
        // Basic text cleanup
        return cleanedSummary.replace(/\s+/g, ' ').trim();
      } catch (error) {
        if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
          console.log(`Retry ${retries + 1} after error with model ${currentModel}:`, error);
          currentModel = FALLBACK_MODEL;
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }
    
    throw new Error("Failed to generate summary after retries");
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
}

/**
 * Summarizes content using an AI model
 * @param content Content to summarize
 * @param style Summarization style to use
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @param model OpenRouter model to use for summarization
 * @returns Summarized content
 */
export async function summarizeContent(
  content: string, 
  style: string, 
  bulletCount?: number, 
  model: string = "google/gemini-2.0-flash-thinking-exp:free"
): Promise<string> {
  try {
    console.log(`Summarizing content with style: ${style}, bullet count: ${bulletCount}, model: ${model}, content length: ${content.length} chars`);
    
    if (!content || content.trim().length < 100) {
      throw new Error("Content is too short to summarize meaningfully (less than 100 characters)");
    }
    
    // Single retry for API calls
    let retries = 0;
    const maxRetries = 1;
    let currentModel = model;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Attempting content summarization with model: ${currentModel}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PUBLIC_API_KEY}`,
            "HTTP-Referer": "https://distill.app",
            "X-Title": "Distill"
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              {
                role: "system",
                content: SummarizationPromptFactory.getPrompt(style, bulletCount)
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
          let errorMessage = `API error (${response.status}: ${response.statusText})`;
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            }
            
            // Check if error is rate limit related
            const isRateLimitError = 
              errorMessage.includes("quota") || 
              errorMessage.includes("rate limit") || 
              errorMessage.includes("capacity") ||
              errorMessage.includes("429") ||
              response.status === 429;
            
            // If it's a rate limit error and we have retries left, try with fallback model
            if (isRateLimitError && retries < maxRetries && currentModel !== FALLBACK_MODEL) {
              console.log(`Rate limit error with model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
              currentModel = FALLBACK_MODEL;
              retries++;
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } catch (e) {
            // If we can't parse the error, use the default message
            console.error("Error parsing API error response:", e);
          }
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Retrying after error: ${errorMessage} with fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Add defensive check for data.choices being undefined or empty
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error("Invalid API response structure:", JSON.stringify(data, null, 2));
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Invalid response from model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error("Invalid response from OpenRouter API - missing or empty choices array");
        }
        
        // Add defensive check for message content
        if (!data.choices[0].message || !data.choices[0].message.content) {
          console.error("Invalid message structure in response:", JSON.stringify(data.choices[0], null, 2));
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Missing content from model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error("Invalid response structure - missing message content");
        }
        
        const summary = data.choices[0].message.content;
        
        // Simple cleanup - no complex processing
        const cleanedSummary = extractContentBetweenMarkers(summary);
        
        if (!cleanedSummary || cleanedSummary.trim().length < 10) {
          console.error("Generated summary is too short or empty:", cleanedSummary);
          
          if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
            console.log(`Empty summary from model ${currentModel}. Switching to fallback model: ${FALLBACK_MODEL}`);
            currentModel = FALLBACK_MODEL;
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error("Failed to generate a meaningful summary");
        }
        
        // Basic text cleanup
        return cleanedSummary.replace(/\s+/g, ' ').trim();
      } catch (error) {
        if (retries < maxRetries && currentModel !== FALLBACK_MODEL) {
          console.log(`Retry ${retries + 1} after error with model ${currentModel}:`, error);
          currentModel = FALLBACK_MODEL;
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }
    
    throw new Error("Failed to generate summary after retries");
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
}
