
/**
 * Generates a prompt for the AI model based on the content and style
 */
export function generatePrompt(
  content: string,
  style: string = 'standard',
  bulletCount?: number
): string {
  // Build basic instruction for the AI
  let instruction = '';
  
  // Normalize style to lowercase for case-insensitive matching
  const normalizedStyle = style.toLowerCase();
  
  // Build the prompt based on style
  if (normalizedStyle === 'standard' || normalizedStyle === 'simple') {
    instruction = `Please summarize the following content concisely and clearly.`;
  } else {
    // For any custom style, provide a general instruction with examples
    instruction = `Please rewrite the following content in "${style}" style. Be creative and fully embrace the style.
    
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
- "tldr": Give an extremely concise "too long; didn't read" summary

If the style doesn't match any of these examples, use your creativity to match the requested style as closely as possible.`;
  }
  
  // Add bullet point instruction if specified
  if (bulletCount && bulletCount > 0) {
    instruction += `\nPresent your response as a list of exactly ${bulletCount} bullet points covering the most important aspects.`;
  }
  
  // Build the complete prompt
  return `${instruction}\n\nContent to process:\n${content}`;
}
