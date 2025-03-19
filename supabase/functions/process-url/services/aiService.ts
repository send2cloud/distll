
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
    
    // Implement retries for API calls
    const maxRetries = 2;
    let retries = 0;
    let summary = '';
    let lastError = null;
    
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
          let errorMessage;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || `API error (${response.status}: ${response.statusText})`;
            
            // Special handling for specific OpenRouter errors
            if (errorMessage.includes("quota")) {
              throw new Error("AI provider quota exceeded. Please try again later or with a different summarization style.");
            }
            if (errorMessage.includes("rate limit")) {
              throw new Error("AI rate limit reached. Please try again in a few moments.");
            }
          } catch (e) {
            errorMessage = `AI provider error (${response.status}: ${response.statusText})`;
          }
          
          console.error(`OpenRouter API error (attempt ${retries + 1}/${maxRetries + 1}):`, errorMessage);
          lastError = new Error(errorMessage);
          
          if (retries >= maxRetries) {
            throw lastError;
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
          retries++;
          continue;
        }

        const data = await response.json();
        summary = data.choices[0].message.content;
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        if (retries >= maxRetries) {
          throw error; // Rethrow after all retries are exhausted
        }
        console.error(`API call failed (attempt ${retries + 1}/${maxRetries + 1}):`, error);
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        retries++;
      }
    }
    
    // Clean up preambles and other unwanted text
    summary = extractContentBetweenMarkers(summary);
    
    if (!summary || summary.trim().length < 10) {
      throw new Error("Failed to generate a meaningful summary. The AI model returned insufficient content.");
    }
    
    // Plain text cleanup for all styles
    summary = summary
      .replace(/\*\*/g, '')   // Remove bold markdown
      .replace(/\*/g, '')     // Remove italic markdown
      .replace(/#{1,6}\s/g, '') // Remove heading markers
      .replace(/\s+/g, ' ')   // Normalize multiple spaces
      .replace(/\n{3,}/g, '\n\n'); // Normalize excessive line breaks
    
    return summary;
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
}
