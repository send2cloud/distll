
/**
 * Service for interacting with the OpenRouter AI API
 * Following Dependency Inversion by abstracting away the AI service details
 */

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Set a reasonable timeout (in milliseconds)
const FETCH_TIMEOUT = 30000;

// Hardcoded API key - safer to use environment variables in production
const OPENROUTER_API_KEY = "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";

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
 * Generate a prompt with style instructions
 */
export function generateStylePrompt(style: string, jinaProxyUrl: string, bulletCount?: number): string {
  // Base prompt with style examples
  const styleExamples = `
Here are some examples of how different styles should be interpreted:
- "eli5": Explain like I'm 5 years old, using simple words and concepts a child would understand
- "top10": Create a numbered list of the 10 most important points in decreasing order of importance
- "bullet-points": Present the key information as a clear, concise bulleted list
- "todo-list": Transform the content into a practical checklist of action items with checkboxes
- "seinfeld-standup": Rewrite as if Jerry Seinfeld was doing a comedy routine about this topic
- "piratetalk": Use pirate language, phrases and terminology throughout
- "haiku": Create beautiful haiku poems that capture the essence of the content
- "clickbait": Use exaggerated, attention-grabbing headlines and phrasings
- "fantasy": Add magical elements and epic storytelling techniques
- "tldr": Give an extremely concise "too long; didn't read" summary`;

  // Create the prompt for the model
  let prompt = `Visit this URL: ${jinaProxyUrl}

Please read the content at this URL, then ${style === 'standard' ? 'summarize it' : 'rewrite it in ' + style + ' style'}${bulletCount ? ` with ${bulletCount} key points` : ''}.

${styleExamples}

If the style doesn't match any of these examples, use your creativity to match the requested style as closely as possible.

If you can't access the URL content, say "I cannot access this URL." Do not make up a summary if you cannot access the content.`;

  return prompt;
}

/**
 * Make a call to the OpenRouter API
 */
export async function callOpenRouterAPI(
  prompt: string,
  model: string = "google/gemma-3-4b-it"
): Promise<string> {
  try {
    console.log("Using hardcoded API key for OpenRouter API");
    
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
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
        throw new Error("API key is invalid or expired. Please provide a valid OpenRouter API key in the settings.");
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
