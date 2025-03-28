
/**
 * Factory class for generating summarization prompts
 */
export class SummarizationPromptFactory {
  /**
   * Gets a summarization prompt based on the style and bullet count
   * @param style Summarization style to use
   * @param bulletCount Number of bullet points for bullet-style summaries
   * @returns The prompt to use for the summarization
   */
  static getPrompt(style: string, bulletCount?: number): string {
    // Base instruction to avoid preambles and postambles, emphasizing PLAIN TEXT output
    const baseInstruction = "CRITICAL: Output ONLY plain text format. NO markdown. NO formatting. Do NOT include ANY introduction or conclusion. NO phrases like 'here's a summary', 'in summary', or 'here are the key points'. NO sign-offs like 'let me know if you need more information'. Start DIRECTLY with content. END immediately after content. Use only basic ASCII characters, no unicode, emojis, or special characters. Format your output with a ### START ### tag at the beginning and ### END ### tag at the end.";
    
    // Important instruction to focus only on the content, not the URL
    const contentFocusInstruction = "IMPORTANT: Base your summary ONLY on the actual CONTENT of the page that has been fetched. DO NOT make assumptions about the content based on the URL or domain name. If the content differs from what the URL might suggest, prioritize what's actually in the content.";
    
    // Check for special cases that need specific handling
    if (style === 'bullets' || style.includes('bullet')) {
      const count = bulletCount || 5;
      return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your task is to identify only the ${count} key takeaways. Present them as numbered items (ex: 1. Point one). Make each point concise and informative. Do not use any special characters or formatting. ${contentFocusInstruction} ${baseInstruction}`;
    }
    
    // For any other style, provide a general instruction that interprets the style from context
    return `You are a helpful assistant that specializes in creating summaries tailored to specific styles or perspectives. The user has requested a summary in the style of "${style}". Use your understanding of this style to adapt your approach. For example:
    
    - If it's a common summarization style (like "standard" or "concise"), focus on delivering appropriate length and detail.
    - If it's a tone or voice instruction (like "clickbait" or "seinfeld-standup"), adopt that tone while keeping the content accurate.
    - If it's a language request (like "tamil" or "spanish"), translate appropriately.
    - If it's a format request (like "bullets" or "tweet"), follow that structural constraint.
    - If it's an audience specification (like "eli5" or "executive"), tailor complexity accordingly.
    
    ${contentFocusInstruction} ${baseInstruction}`;
  }
}
