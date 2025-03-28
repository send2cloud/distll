
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
    // Updated instruction to request markdown formatting which is natural for LLMs
    const baseInstruction = "IMPORTANT: Format your response using markdown. Use proper paragraph breaks, bullet points, and numbered lists. For numbered lists, use standard markdown format (1. First point). Use markdown headers (##, ###) for section titles if needed. NO introduction or conclusion phrases like 'here's a summary' or 'in summary'. NO sign-offs like 'let me know if you need more information'. Start DIRECTLY with content. END immediately after content. To help extraction, format your output with a ### START ### tag at the beginning and ### END ### tag at the end.";
    
    // Important instruction to focus only on the content, not the URL
    const contentFocusInstruction = "CRITICAL: Base your summary ONLY on the actual CONTENT of the page that has been fetched. DO NOT make assumptions about the content based on the URL or domain name. If the content differs from what the URL might suggest, prioritize what's actually in the content.";
    
    // Enhanced style-specific prompts with stronger styling guidance
    if (style === 'bullets' || style.includes('bullet')) {
      const count = bulletCount || 5;
      return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your task is to identify only the ${count} key takeaways. Format them as a properly numbered markdown list (1. First point, etc.) with one point per line. Make each point concise but complete. ${contentFocusInstruction} ${baseInstruction}`;
    }
    
    // Enhanced clickbait style with specific instructions
    if (style === 'clickbait') {
      return `You are a master of writing ATTENTION-GRABBING clickbait content. Your task is to rewrite the content in the MOST SENSATIONAL, DRAMATIC way possible. Use EXCESSIVE CAPITALIZATION, dramatic phrases, emotional language, hyperbole, and shocking statements. Make everything sound INCREDIBLY exciting or controversial! Use phrases like "YOU WON'T BELIEVE", "SHOCKING", "MIND-BLOWING", and add exclamation points!!! Break traditional writing rules for maximum drama. Phrase things as mysterious questions or incomplete teasers when possible. ${contentFocusInstruction} ${baseInstruction}`;
    }

    // Enhanced tweet style
    if (style === 'tweet') {
      return `You are a social media expert who crafts perfect tweet-length summaries. Create a summary in exactly 280 characters or less. Be concise yet informative. Use hashtags appropriately. Capture the essence of the content in a way that would drive engagement on Twitter. ${contentFocusInstruction} ${baseInstruction}`;
    }

    // Enhanced ELI5 style
    if (style === 'eli5') {
      return `You are explaining this content to a 5-year-old child. Use VERY simple language, short sentences, and familiar examples. Avoid all technical terms or jargon. Compare complex ideas to things a child would understand like toys, food, or simple activities. Make it fun and engaging as if you're telling a story to a young child. ${contentFocusInstruction} ${baseInstruction}`;
    }

    // Enhanced Seinfeld standup style
    if (style === 'seinfeld-standup') {
      return `You are Jerry Seinfeld doing observational comedy standup. Rewrite the content in Jerry's characteristic style, using his classic "What's the deal with..." format, exaggerated observations about mundane details, and his signature rhetorical questions. Add Seinfeld-style humor, focus on the absurdity of everyday situations, and include his characteristic vocal patterns and timing in your writing. Make it funny and observational rather than factual. ${contentFocusInstruction} ${baseInstruction}`;
    }
    
    // For any other style, provide a general instruction that interprets the style from context
    return `You are a helpful assistant that specializes in creating summaries tailored to specific styles or perspectives. The user has requested a summary in the style of "${style}". Use your understanding of this style to adapt your approach. For example:
    
    - If it's a common summarization style (like "standard" or "concise"), focus on delivering appropriate length and detail.
    - If it's a tone or voice instruction (like "clickbait" or "seinfeld-standup"), adopt that tone while keeping the content accurate.
    - If it's a language request (like "tamil" or "spanish"), translate appropriately.
    - If it's a format request (like "bullets" or "tweet"), follow that structural constraint.
    - If it's an audience specification (like "eli5" or "executive"), tailor complexity accordingly.
    
    IMPORTANT: If the style indicates a list format or multiple points, use proper markdown list formatting.
    
    ${contentFocusInstruction} ${baseInstruction}`;
  }
}
