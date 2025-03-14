
import { getSettings } from "./settings";
import { SummarizationStyle } from "@/components/SettingsModal";

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
  // Try to extract content between START and END tags if they exist
  const tagPattern = /###\s*START\s*###([\s\S]*?)###\s*END\s*###/i;
  const tagMatch = text.match(tagPattern);
  
  if (tagMatch && tagMatch[1]) {
    return tagMatch[1].trim();
  }
  
  // List of common preambles to remove (expanded list)
  const preambles = [
    "Here is the summary:",
    "Here's a summary of the key takeaways:",
    "Here's a summary of the content:",
    "Here is a summary:",
    "Here's a summary:",
    "Summary:",
    "Here's the summary:",
    "Organized for clarity:",
    "Here are the key points:",
    "Here are the main points:",
    "Here's what you need to know:",
    "In summary:",
    "To summarize:",
    "The key takeaways are:",
    "Based on the content:",
    "From the content provided:",
    "After reviewing the content:",
    "Based on the article:",
    "The main points are:",
    "Please visit the URL:",
    "Here's a summary of the URL:",
    "After visiting the URL,",
    "From the URL,",
    "Based on the URL,",
    "I'll summarize this for you:",
    "I'll explain this simply:",
    "To explain like you're 5:",
    "In simple terms:",
    "Let me break this down:",
    "Let me simplify this for you:",
    "Let me summarize this article:",
    "Okay, here's a summary of the",
    "Okay, here's",
    "Okay,",
    "I'll summarize",
    "Here is the information about",
    "From the information provided",
    "Here's what you should know about",
    "Based on the information provided",
  ];
  
  // Common endings to remove
  const endings = [
    "Let me know if you'd like more information",
    "Let me know if you need more details",
    "Let me know if you have any questions",
    "Let me know if you'd like me to clarify anything",
    "Let me know if you'd like me to summarize another piece of content",
    "Let me know if there's anything else you'd like to know",
    "If you have any further questions, feel free to ask",
    "Hope this helps!",
    "I hope this helps!",
    "Feel free to ask if you need more information",
    "If you need more details, please ask",
    "---\n\nLet me know",  // Specific pattern from our example
    "---\n\nI hope",
    "\n---\n",  // Common markdown separator that might indicate the end
  ];
  
  let cleanedText = text;
  
  // Try to find and remove preambles at the beginning of the text
  for (const preamble of preambles) {
    const preambleRegex = new RegExp(`^\\s*${preamble}\\s*`, 'i');
    cleanedText = cleanedText.replace(preambleRegex, '');
  }
  
  // Try to remove endings
  for (const ending of endings) {
    const endingRegex = new RegExp(`${ending}.*$`, 'i');
    cleanedText = cleanedText.replace(endingRegex, '');
  }
  
  // Remove any sentences that mention visiting a URL or fetching content
  cleanedText = cleanedText.replace(/\b(I visited|I checked|I browsed|I accessed|I reviewed|I read|I analyzed|After visiting)\b[^.]*\bURL\b[^.]*\./gi, '');
  cleanedText = cleanedText.replace(/\b(According to the|From the|Based on the|The|This)\b[^.]*\b(webpage|website|article|page|content)\b[^.]*\./gi, '');
  
  // Remove phrases like "Here's a summary in bullet points:" that might appear before bullet lists
  cleanedText = cleanedText.replace(/\b(Here's|Here are|These are|The following are)\b[^:]*\bpoints?\b[^:]*:/gi, '');
  
  // Clean up any extra whitespace that might have been created
  cleanedText = cleanedText.trim();
  
  return cleanedText;
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
