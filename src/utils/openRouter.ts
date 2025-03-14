
import { getSettings } from "./settings";

export const summarizeContent = async (content: string) => {
  const settings = getSettings();
  
  if (!settings.openRouterApiKey) {
    throw new Error("OpenRouter API key not set. Please configure it in settings.");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openRouterApiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Distill"
      },
      body: JSON.stringify({
        model: "google/gemma-3-1b-it:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your goal is to identify the key information and present it in an easily digestible format. Always write your summary in markdown format. Use appropriate formatting like lists, headers, and bold text. If content contains rankings or lists (like top 10), format them as proper numbered lists. Never include phrases like 'Here is the summary' or 'Organized for clarity' - just present the summary directly."
          },
          {
            role: "user",
            content: `Please summarize the following content. Extract the main points, key insights, and important details. Use proper markdown formatting with appropriate headers, lists, and emphasis where needed. Present the summary directly without any introduction or preamble:\n\n${content}`
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
    
    // Remove common preambles if they exist
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

export const summarizeUrl = async (url: string) => {
  const settings = getSettings();
  
  if (!settings.openRouterApiKey) {
    throw new Error("OpenRouter API key not set. Please configure it in settings.");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.openRouterApiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Distill"
      },
      body: JSON.stringify({
        model: "google/gemma-3-1b-it:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your goal is to identify the key information and present it in an easily digestible format. Always write your summary in markdown format. Use appropriate formatting like lists, headers, and bold text. If content contains rankings or lists (like top 10), format them as proper numbered lists. Never include phrases like 'Here is the summary' or 'Organized for clarity' - just present the summary directly."
          },
          {
            role: "user",
            content: `Please visit the URL ${url} and summarize its content. Extract the main points, key insights, and important details. Use proper markdown formatting with appropriate headers, lists, and emphasis where needed. Present the summary directly without any introduction or preamble.`
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
    
    // Remove common preambles if they exist
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
