import { getSettings } from "./settings";
import { SummarizationStyle } from "@/components/SettingsModal";

const getSummarizationPrompt = (style: SummarizationStyle, bulletCount?: number): string => {
  switch (style) {
    case 'simple':
      return "You are a helpful assistant that specializes in simplifying complex content. Your goal is to rewrite the provided text in simple, easy-to-understand English with short sentences and common words. Avoid jargon and technical terms when possible. Format your summary in markdown with appropriate headings and lists. Don't include introductory phrases - just present the simplified content directly.";
    
    case 'bullets':
      const count = bulletCount || 5;
      return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your goal is to identify only the ${count} key takeaways and present them as a numbered list in markdown format. Make each point concise but informative. Don't include any introduction or conclusion - just present the ${count} bullet points directly.`;
    
    case 'eli5':
      return "You are a helpful assistant that specializes in explaining complex topics as if talking to a 5-year-old child. Your goal is to use very simple language, basic analogies, and avoid technical terms. Break down complicated ideas into easily digestible concepts. Format your explanation in markdown with appropriate headings and emphasis where needed. Don't include any introductions - just present the ELI5 explanation directly.";
    
    case 'concise':
      return "You are a helpful assistant that specializes in creating extremely concise summaries. Your goal is to distill the content down to its absolute essence in as few words as possible while retaining all key information. Use short sentences and be very economical with language. Format your response in markdown. Don't include any introductions - just present the concise summary directly.";
    
    case 'tweet':
      return "You are a helpful assistant that specializes in creating tweet-sized summaries. Your goal is to distill the content into exactly 140 characters or less. Be extremely concise while capturing the most essential point. Don't use hashtags unless they're crucial to the meaning. Don't include any introductions - just present the tweet directly.";
    
    case 'standard':
    default:
      return "You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your goal is to identify the key information and present it in an easily digestible format. Always write your summary in markdown format. Use appropriate formatting like lists, headers, and bold text. If content contains rankings or lists (like top 10), format them as proper numbered lists. Never include phrases like 'Here is the summary' or 'Organized for clarity' - just present the summary directly.";
  }
};

export const summarizeContent = async (content: string, style?: SummarizationStyle, bulletCount?: number) => {
  const settings = getSettings();
  
  if (!settings.openRouterApiKey) {
    throw new Error("OpenRouter API key not set. Please configure it in settings.");
  }

  // Use provided style or fall back to settings
  const summarizationStyle = style || settings.summarizationStyle;
  const bulletCountToUse = bulletCount;
  
  console.log("Summarizing with style:", summarizationStyle, "and bullet count:", bulletCountToUse);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openRouterApiKey}`,
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
            content: `Please summarize the following content according to the style specified in my system message:\n\n${content}`
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
    
    const preambles = [
      "Here is the summary:",
      "Here is a summary:",
      "Summary:",
      "Here's the summary:",
      "Here's a summary:",
      "Organized for clarity:",
    ];
    
    preambles.forEach(preamble => {
      if (summary.startsWith(preamble)) {
        summary = summary.substring(preamble.length).trim();
      }
    });
    
    return summary;
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
};

export const summarizeUrl = async (url: string, style?: SummarizationStyle, bulletCount?: number) => {
  const settings = getSettings();
  
  if (!settings.openRouterApiKey) {
    throw new Error("OpenRouter API key not set. Please configure it in settings.");
  }

  // Use provided style or fall back to settings
  const summarizationStyle = style || settings.summarizationStyle;
  const bulletCountToUse = bulletCount;
  
  console.log("Summarizing URL with style:", summarizationStyle, "and bullet count:", bulletCountToUse);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openRouterApiKey}`,
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
            content: `Please visit the URL ${url} and summarize its content according to the style specified in my system message.`
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
    
    const preambles = [
      "Here is the summary:",
      "Here is a summary:",
      "Summary:",
      "Here's the summary:",
      "Here's a summary:",
      "Organized for clarity:",
    ];
    
    preambles.forEach(preamble => {
      if (summary.startsWith(preamble)) {
        summary = summary.substring(preamble.length).trim();
      }
    });
    
    return summary;
  } catch (error) {
    console.error("Failed to summarize URL:", error);
    throw error;
  }
};
