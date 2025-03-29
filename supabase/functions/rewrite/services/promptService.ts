
/**
 * Prompt generation service following Single Responsibility Principle
 * This service is responsible for generating appropriate prompts for the AI model
 */

// Interface for prompt options to follow Interface Segregation Principle
interface PromptOptions {
  content: string;
  style: string;
  bulletCount?: number;
}

/**
 * Style-specific prompt generator that follows Open-Closed Principle
 * New styles can be added without modifying existing code
 */
class PromptGenerator {
  private static readonly STYLE_EXAMPLES = `
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

  /**
   * Generate a standard prompt with basic instructions
   */
  private generateStandardPrompt(options: PromptOptions): string {
    let prompt = `Please summarize the following content concisely and clearly.`;
    
    if (options.bulletCount && options.bulletCount > 0) {
      prompt += `\nPresent your response as a list of exactly ${options.bulletCount} bullet points covering the most important aspects.`;
    }
    
    return this.finalizePrompt(prompt, options.content);
  }
  
  /**
   * Generate a custom style prompt with creative instructions
   */
  private generateStyledPrompt(options: PromptOptions): string {
    let prompt = `Please rewrite the following content in "${options.style}" style. Be creative and fully embrace the style.
    
${PromptGenerator.STYLE_EXAMPLES}

If the style doesn't match any of these examples, use your creativity to match the requested style as closely as possible.`;
    
    if (options.bulletCount && options.bulletCount > 0) {
      prompt += `\nPresent your response as a list of exactly ${options.bulletCount} bullet points covering the most important aspects.`;
    }
    
    return this.finalizePrompt(prompt, options.content);
  }
  
  /**
   * Add content to prompt and format it properly
   */
  private finalizePrompt(instruction: string, content: string): string {
    return `${instruction}\n\nContent to process:\n${content}`;
  }
  
  /**
   * Public method to generate appropriate prompt based on style
   */
  public generatePrompt(options: PromptOptions): string {
    // Normalize style to lowercase for case-insensitive matching
    const normalizedStyle = options.style.toLowerCase();
    
    // Generate prompt based on style
    if (normalizedStyle === 'standard' || normalizedStyle === 'simple') {
      return this.generateStandardPrompt(options);
    } else {
      return this.generateStyledPrompt(options);
    }
  }
}

// Factory function to create and use the prompt generator (Dependency Inversion)
export function generatePrompt(
  content: string,
  style: string = 'standard',
  bulletCount?: number
): string {
  const promptGenerator = new PromptGenerator();
  return promptGenerator.generatePrompt({ content, style, bulletCount });
}
