
/**
 * Prompt service for generating prompts for the AI service
 * This follows the Single Responsibility Principle - this service only handles prompt generation
 */

// Function to create a generic flexible prompt that can handle any style
export function createPrompt(
  jinaProxyUrl: string,
  style: string,
  bulletCount?: number
): string {
  // Base system instructions that work for any style
  let systemPrompt = `You are an AI assistant that summarizes web content from the provided URL.
Focus on extracting and summarizing the main points of the content.
Your response should be well-structured and easy to read.

IMPORTANT:
1. Focus ONLY on the main content of the page - ignore navigation, ads, footers, etc.
2. If you can't access the content or the URL doesn't work, explain the issue clearly.
3. Do not mention that you're an AI in your response.
4. Do not add your own opinions or external information - stick to what's in the content.
5. Format your response appropriately based on the requested style.`;

  // Add style-specific instructions based on user input
  if (style && style !== 'standard') {
    // Log the requested style for debugging
    console.log(`Interpreting style: "${style}"`);
    
    // Add style interpretation guidance
    systemPrompt += `\n\nSTYLE INTERPRETATION:
The user has requested style: "${style}"

Interpret this style creatively and adapt your summary accordingly. Here are some examples of how to interpret different styles:
- "eli5": Explain the content as you would to a 5-year-old using simple language and concepts
- "bullets" or any number like "5": Present the main points as bullet points, limiting to the specified number if given
- "clickbait": Write in an attention-grabbing, sensationalist style with emotional language
- "seinfeld-standup": Write in the style of Jerry Seinfeld's observational comedy
- "piratetalk": Use pirate language and expressions
- "haiku": Format the summary as one or more haiku poems
- "top10": Present the content as a top 10 list of the most important points
- "todo-list": Format as action items in a to-do list with checkboxes
- "fantasy": Write in the style of a fantasy novel
- "tldr": Ultra-concise "too long, didn't read" summary

Be creative with your interpretation - the style could be anything from a literary genre to a character voice to a format.`;

    // Handle numeric styles (like 5, 10) specifically for bullet points
    if (/^\d+$/.test(style)) {
      const count = parseInt(style, 10);
      systemPrompt += `\n\nSince the style is just a number (${count}), create a bullet-point summary with exactly ${count} points.`;
    }
    // Add specific guidance for bullet count if provided separately
    else if (bulletCount && bulletCount > 0) {
      systemPrompt += `\n\nLimit your bullet points to exactly ${bulletCount} items.`;
    }
  }

  // Construct the user prompt with the URL
  const userPrompt = `Summarize the content from this URL: ${jinaProxyUrl}`;

  // Log the final prompt for debugging (without the full URL for security/privacy)
  console.log(`Generated prompt with style: "${style}" and bulletCount: ${bulletCount || 'not specified'}`);

  // Return the complete prompt object
  return JSON.stringify({
    system_prompt: systemPrompt,
    user_prompt: userPrompt
  });
}

// Similar function for direct content
export function createContentPrompt(
  content: string,
  style: string,
  bulletCount?: number
): string {
  // Base system instructions
  let systemPrompt = `You are an AI assistant that summarizes provided content.
Focus on extracting and summarizing the main points.
Your response should be well-structured and easy to read.

IMPORTANT:
1. Focus ONLY on the provided content.
2. Do not mention that you're an AI in your response.
3. Do not add your own opinions or external information - stick to what's in the content.
4. Format your response appropriately based on the requested style.`;

  // Add style-specific instructions based on user input
  if (style && style !== 'standard') {
    // Log the requested style for debugging
    console.log(`Interpreting style for direct content: "${style}"`);
    
    // Add style interpretation guidance
    systemPrompt += `\n\nSTYLE INTERPRETATION:
The user has requested style: "${style}"

Interpret this style creatively and adapt your summary accordingly. Here are some examples of how to interpret different styles:
- "eli5": Explain the content as you would to a 5-year-old using simple language and concepts
- "bullets" or any number like "5": Present the main points as bullet points, limiting to the specified number if given
- "clickbait": Write in an attention-grabbing, sensationalist style with emotional language
- "seinfeld-standup": Write in the style of Jerry Seinfeld's observational comedy
- "piratetalk": Use pirate language and expressions
- "haiku": Format the summary as one or more haiku poems
- "top10": Present the content as a top 10 list of the most important points
- "todo-list": Format as action items in a to-do list with checkboxes
- "fantasy": Write in the style of a fantasy novel
- "tldr": Ultra-concise "too long, didn't read" summary

Be creative with your interpretation - the style could be anything from a literary genre to a character voice to a format.`;

    // Handle numeric styles (like 5, 10) specifically for bullet points
    if (/^\d+$/.test(style)) {
      const count = parseInt(style, 10);
      systemPrompt += `\n\nSince the style is just a number (${count}), create a bullet-point summary with exactly ${count} points.`;
    }
    // Add specific guidance for bullet count if provided separately
    else if (bulletCount && bulletCount > 0) {
      systemPrompt += `\n\nLimit your bullet points to exactly ${bulletCount} items.`;
    }
  }

  // Construct the user prompt with content preview
  const contentPreview = content.length > 100 ? 
    `${content.substring(0, 100)}... (${content.length} characters total)` : 
    content;
  
  const userPrompt = `Summarize the following content: ${content}`;

  // Log the final prompt for debugging (without the full content for security/privacy)
  console.log(`Generated content prompt with style: "${style}", content preview: "${contentPreview}" and bulletCount: ${bulletCount || 'not specified'}`);

  // Return the complete prompt object
  return JSON.stringify({
    system_prompt: systemPrompt,
    user_prompt: userPrompt
  });
}
