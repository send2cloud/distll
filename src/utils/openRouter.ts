
import { getSettings } from "./settings";

export const summarizeContent = async (content: string): Promise<string> {
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
        "HTTP-Referer": "https://llmcc.com", // Replace with your actual domain
        "X-Title": "Distill"
      },
      body: JSON.stringify({
        model: "google/gemma-3-1b-it:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your goal is to identify the key information and present it in an easily digestible format."
          },
          {
            role: "user",
            content: `Please summarize the following content. Extract the main points, key insights, and important details. Organize your summary in a clear, structured format:\n\n${content}`
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Failed to summarize content:", error);
    throw error;
  }
};
