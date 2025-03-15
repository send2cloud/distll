import { getSettings } from "./settings";
import { SummarizationStyle } from "@/components/SettingsModal";
import { extractContentBetweenMarkers } from "./textFormatting";

// Default public API key with $5 limit
const PUBLIC_API_KEY = "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";

const getSummarizationPrompt = (style: SummarizationStyle, bulletCount?: number): string => {
  // Base instruction to avoid preambles and postambles
  const baseInstruction = "CRITICAL: Do NOT include ANY introduction or conclusion. NO phrases like 'here's a summary', 'in summary', or 'here are the key points'. NO sign-offs like 'let me know if you need more information'. Start DIRECTLY with content. END immediately after content. Any preamble or postamble will result in rejection. Format your output with a ### START ### tag at the beginning and ### END ### tag at the end.";
  
  switch (style) {
    case 'simple':
      return `You are a helpful assistant that specializes in simplifying complex content. Your task is to rewrite the provided text in simple, easy-to-understand English with short sentences and common words. Avoid jargon and technical terms when possible. Format your output in markdown with appropriate headings and lists. ${baseInstruction}`;
    
    case 'bullets':
      const count = bulletCount || 5;
      return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your task is to identify only the ${count} key takeaways and present them as a numbered list in markdown format. Make each point concise but informative. ${baseInstruction}`;
    
    case 'eli5':
      return `You are a helpful assistant that specializes in explaining complex topics in simple terms. Your task is to use very simple language, basic analogies, and avoid technical terms. Break down complicated ideas into easily digestible concepts. Format your explanation in markdown with appropriate headings and emphasis where needed. ${baseInstruction}`;
    
    case 'concise':
      return `You are a helpful assistant that specializes in creating extremely concise summaries. Your task is to distill the content down to its absolute essence in as few words as possible while retaining all key information. Use short sentences and be very economical with language. Format your response in markdown. ${baseInstruction}`;
    
    case 'tweet':
      return `You are a helpful assistant that specializes in creating tweet-sized summaries. Your task is to distill the content into exactly 140 characters or less. Be extremely concise while capturing the most essential point. Don't use hashtags unless they're crucial to the meaning. ${baseInstruction}`;
    
    case 'standard':
    default:
      return `You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your task is to identify the key information and present it in an easily digestible format. Always write your summary in markdown format. Use appropriate formatting like lists, headers, and bold text. If content contains rankings or lists (like top 10), format them as proper numbered lists. ${baseInstruction}`;
  }
};

const cleanupPreambles = (text: string): string => {
  // Use our comprehensive text extraction utility
  return extractContentBetweenMarkers(text);
};

export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  const settings = getSettings();
  
  // Use personal API key if available, otherwise use public key
  const apiKey = settings.openRouterApiKey || PUBLIC_API_KEY;
  
  // Use provided style or fall back to settings
  const summarizationStyle = style || settings.summarizationStyle;
  const bulletCountToUse = bulletCount;
  
  console.log("Summarizing with style:", summarizationStyle, "and bullet count:", bulletCountToUse, "using API key:", apiKey ? apiKey.substring(0, 10) + "..." : "none");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin || "https://distill.app",
        "X-Title": "Distill"
      },
      body: JSON.stringify({
        model: "google/gemma-3-1b-it:free",
        messages: [
          {
            role: "system",
            content: getSummarizationPrompt(summarizationStyle, bulletCountToUse)
          },
          {
            role: "user",
            content: `Summarize the following content according to the style specified in my system message. Remember: Start directly with content. No preamble. No postamble.\n\n${content}`
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
      } catch (e) {
        errorMessage = `API error (${response.status}: ${response.statusText})`;
      }
      
      console.error("OpenRouter API error:", errorMessage);
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    const data = await response.json();
    let summary = data.choices[0].message.content;
    
    // Clean up preambles and other unwanted text
    summary = cleanupPreambles(summary);
    
    return summary;
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
};

export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  const settings = getSettings();
  
  // Use personal API key if available, otherwise use public key
  const apiKey = settings.openRouterApiKey || PUBLIC_API_KEY;
  
  // Use provided style or fall back to settings
  const summarizationStyle = style || settings.summarizationStyle;
  const bulletCountToUse = bulletCount;
  
  console.log("Summarizing URL with style:", summarizationStyle, "and bullet count:", bulletCountToUse, "using API key:", apiKey ? apiKey.substring(0, 10) + "..." : "none");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin || "https://distill.app",
        "X-Title": "Distill"
      },
      body: JSON.stringify({
        model: "google/gemma-3-1b-it:free",
        messages: [
          {
            role: "system",
            content: getSummarizationPrompt(summarizationStyle, bulletCountToUse)
          },
          {
            role: "user",
            content: `Visit the URL ${url} and summarize its content according to the style specified in my system message. Remember: Start directly with content. No preamble. No postamble. Begin with ### START ### and end with ### END ###.`
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
      } catch (e) {
        errorMessage = `API error (${response.status}: ${response.statusText})`;
      }
      
      console.error("OpenRouter API error:", errorMessage);
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    const data = await response.json();
    let summary = data.choices[0].message.content;
    
    // Clean up preambles and other unwanted text
    summary = cleanupPreambles(summary);
    
    return summary;
  } catch (error) {
    console.error("Failed to summarize URL:", error);
    throw error;
  }
};
