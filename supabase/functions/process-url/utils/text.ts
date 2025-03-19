
/**
 * Extracts content between markers in the text or returns the original text
 * @param text The text to process
 * @returns The cleaned text
 */
export function extractContentBetweenMarkers(text: string): string {
  if (!text) return '';
  
  // Remove any AI model preambles, postambles, or markdown formatting
  let cleaned = text
    .replace(/^(Here is|I've created|Below is|This is|The following is|Here's)[^]*?:/i, '')
    .replace(/^(\*\*|\*|#|##|###)\s*[a-zA-Z\s]+(Summary|Content|Text|Analysis)(\*\*|\*|#|##|###)/i, '')
    .replace(/(\*\*|\*|#|##|###)\s*(End|Conclusion|Summary|That's it)([^]*?)$/i, '')
    .replace(/\*\*/g, '')  // Remove bold
    .replace(/\*/g, '');   // Remove italic
  
  // Clean up whitespace
  cleaned = cleaned.trim();
  
  return cleaned || text; // Return original if cleaning removed everything
}
