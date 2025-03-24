
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
    
    // Check for standard predefined styles first
    switch (style) {
      case 'simple':
        return `You are a helpful assistant that specializes in simplifying complex content. Your task is to rewrite the provided text in simple, easy-to-understand English with short sentences and common words. Avoid jargon and technical terms when possible. ${baseInstruction}`;
      
      case 'bullets':
        const count = bulletCount || 5;
        return `You are a helpful assistant that specializes in extracting the ${count} most important points from content. Your task is to identify only the ${count} key takeaways. Present them as numbered items (ex: 1. Point one). Make each point concise and informative. Do not use any special characters or formatting. ${baseInstruction}`;
      
      case 'eli5':
        return `You are a helpful assistant that explains complex topics as if to a 5-year-old child. Use ONLY very simple language. Short sentences. Common words. Avoid ANY complex terms. Keep paragraphs to 2-3 simple sentences. Pretend the audience knows nothing about the topic. ${baseInstruction}`;
      
      case 'concise':
        return `You are a helpful assistant that specializes in creating extremely concise summaries. Your task is to distill the content down to its absolute essence in as few words as possible while retaining all key information. Use short sentences and be very economical with language. ${baseInstruction}`;
      
      case 'tweet':
        return `You are a helpful assistant that specializes in creating tweet-sized summaries. Your task is to distill the content into exactly 140 characters or less. Be extremely concise while capturing the most essential point. Don't use hashtags. ${baseInstruction}`;
      
      case 'standard':
        return `You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your task is to identify the key information and present it in a plain text format. If content contains rankings or lists (like top 10), format them as proper numbered items. ${baseInstruction}`;
      
      default:
        // Handle custom style modifiers
        if (style && style !== 'standard') {
          return `You are a helpful assistant that specializes in creating summaries tailored to specific styles or perspectives. The user has requested a summary in the style of "${style}". Use your understanding of this style modifier to adapt your approach. For example, if it's a language or cultural reference (like "tamil" or "spanish"), adapt to that cultural or linguistic context. If it's a writing style (like "clickbait" or "academic"), adapt the tone and format accordingly. If it's a bias or perspective (like "leftbias" or "rightbias"), present the content from that perspective while making it clear you're following a style instruction. If it's a business format (like "executivesummary"), follow established conventions for that format. If you don't understand the style, default to a clear, concise summary. ${baseInstruction}`;
        }
        
        // If nothing matches, use standard prompt
        return `You are a helpful assistant that specializes in distilling complex content into concise and clear summaries. Your task is to identify the key information and present it in a plain text format. If content contains rankings or lists (like top 10), format them as proper numbered items. ${baseInstruction}`;
    }
  }
}
