
/**
 * Factory class for generating summarization prompts
 * Following the Single Responsibility Principle - this class only handles prompt generation
 */
export class SummarizationPromptFactory {
  /**
   * Gets a summarization prompt based on the style
   * @param style Summarization style to use
   * @param bulletCount Optional number of bullet points (if specified)
   * @returns The prompt to use for the summarization
   */
  static getPrompt(style: string, bulletCount?: number): string {
    // Define a base instruction that doesn't enforce specific formatting for all styles
    const baseInstruction = "IMPORTANT: Format your response appropriately based on the style requested. Use proper paragraph breaks and formatting. DO NOT include introductions or conclusions like 'here's a summary' or 'in summary'. NO sign-offs. Start DIRECTLY with content. To help extraction, format your output with a ### START ### tag at the beginning and ### END ### tag at the end.";
    
    // Important instruction to focus only on the content, not the URL
    const contentFocusInstruction = "CRITICAL: Base your summary ONLY on the actual CONTENT of the page that has been fetched. DO NOT make assumptions about the content based on the URL or domain name. If the content differs from what the URL might suggest, prioritize what's actually in the content.";

    // Handle the case where a bullet count is explicitly provided
    if (bulletCount && bulletCount > 0) {
      return `You are a helpful assistant that specializes in extracting the ${bulletCount} most important points from content. Your task is to identify only the ${bulletCount} key takeaways. Format them as a properly numbered markdown list (1. First point, etc.) with one point per line. Make each point concise but complete. ${contentFocusInstruction} ${baseInstruction}`;
    }
    
    // General flexible prompt with examples for different style interpretations
    return `You are a helpful assistant that specializes in creating summaries tailored to various styles. The user has requested a summary in the style: "${style}". 
    
    Use your understanding to adapt your approach based on the style. Some examples of how to interpret different styles:

    - If the style is "bullets" or contains a number like "5", create a summary with that many bullet points or a reasonable number if not specified.
    - If the style is "tweet", create a concise summary that would fit within tweet length (280 characters).
    - If the style is "eli5" or "simple", explain the content as if to a 5-year-old using very simple language.
    - If the style is "clickbait", use sensational, attention-grabbing language with capitalized words for emphasis.
    - If the style is "seinfeld-standup", write in Jerry Seinfeld's observational comedy style with "What's the deal with..." format.
    - If the style is "pirate" or "piratetalk", use pirate language and expressions.
    - If the style is "haiku", create a summary in haiku form with 5-7-5 syllable structure.
    - If the style is "top10" or "listicle", create a numbered list of the top 10 points.
    - If the style is "todo-list" or "tasks", format as a checklist of action items with checkboxes.
    - If the style is "joke", create a humorous summary that makes light of the content.
    - If the style seems to be a language (like "spanish", "tamil", "french"), translate the summary to that language.

    These are just examples. Use your creativity to interpret any style name in a way that would make sense to humans. The style might indicate a tone, voice, format, audience level, or language.

    ${contentFocusInstruction}
    
    ${baseInstruction}`;
  }
}
