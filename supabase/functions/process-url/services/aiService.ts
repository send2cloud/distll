
import { extractContentBetweenMarkers } from "../utils/text.ts";
import { SummarizationPromptFactory } from "./promptService.ts";

// Fixed public API key with $5 limit that will be used for all requests
const PUBLIC_API_KEY = "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";

/**
 * Summarizes content using an AI model
 * @param content Content to summarize
 * @param style Summarization style to use
 * @param bulletCount Number of bullet points for bullet-style summaries
 * @returns Summarized content
 */
export async function summarizeContent(content: string, style: string, bulletCount?: number): Promise<string> {
  try {
    console.log(`Summarizing content with style: ${style}, bullet count: ${bulletCount}, content length: ${content.length} chars`);
    
    if (!content || content.trim().length < 100) {
      throw new Error("Content is too short to summarize meaningfully (less than 100 characters)");
    }
    
    // Single retry for API calls
    let retries = 0;
    const maxRetries = 1;
    
    while (retries <= maxRetries) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PUBLIC_API_KEY}`,
            "HTTP-Referer": "https://distill.app",
            "X-Title": "Distill"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-thinking-exp:free",
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
          } catch (e) {
            // If we can't parse the error, use the default message
          }
          
          if (retries < maxRetries) {
            console.log(`Retrying after error: ${errorMessage}`);
            retries++;
            // Wait 1 second before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const summary = data.choices[0].message.content;
        
        // Simple cleanup - no complex processing
        const cleanedSummary = extractContentBetweenMarkers(summary);
        
        if (!cleanedSummary || cleanedSummary.trim().length < 10) {
          throw new Error("Failed to generate a meaningful summary");
        }
        
        // Basic text cleanup
        return cleanedSummary.replace(/\s+/g, ' ').trim();
      } catch (error) {
        if (retries < maxRetries) {
          console.log(`Retry ${retries + 1} after error:`, error);
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
