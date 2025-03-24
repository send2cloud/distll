
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
    const baseInstruction = "CRITICAL: Output ONLY plain text format. NO markdown. NO formatting. Do NOT include ANY introduction or conclusion. NO phrases like 'here's a summary', 'in summary', or 'here are the key points'. NO sign-offs like 'let me know if you need more information'. Start DIRECTLY with content. END immediately after content. Use only basic ASCII characters, no unicode, emojis, or special characters.";
    
    // Special case for bullets with a number
    if (style === 'bullets' && bulletCount) {
      return `You are a helpful assistant that specializes in extracting the ${bulletCount} most important points from content. Your task is to identify only the ${bulletCount} key takeaways. Present them as numbered items (ex: 1. Point one). Make each point concise and informative. Do not use any special characters or formatting. ${baseInstruction}`;
    }
    
    // For standard/default style (when style is empty or 'standard')
    if (!style || style === 'standard') {
      return `You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your task is to identify the key information and present it in a plain text format. If content contains rankings or lists (like top 10), format them as proper numbered items. ${baseInstruction}`;
    }
    
    // For any other style string, pass it as an instruction to the LLM
    return `You are a helpful assistant that specializes in creating summaries tailored to specific styles or perspectives. The user has requested a summary in the style of "${style}". Interpret this style instruction and adapt your approach accordingly:

1. If it's a language or cultural reference (like "tamil" or "spanish"), adapt to that cultural or linguistic context.
2. If it's a writing style (like "academic" or "poetic"), adapt the tone and format accordingly.
3. If it's a character or persona (like "pirate" or "shakespeare"), write in that style or voice.
4. If it's a format instruction (like "bullet points" or "haiku"), follow that structural guideline.
5. If it's a complexity level (like "simple" or "technical"), adjust your vocabulary and concepts to match.
6. If it's a perspective (like "conservative" or "progressive"), present the content from that viewpoint.

Use your best judgment to interpret the style instruction. If you don't understand the requested style, default to a clear, concise summary. ${baseInstruction}`;
  }
}
