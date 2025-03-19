
/**
 * Basic text cleaning function - minimal processing as Jina proxy already provides clean content
 * @param text The text to process
 * @returns The cleaned text
 */
export function extractContentBetweenMarkers(text: string): string {
  if (!text) return '';
  
  // Basic cleanup only - Jina proxy content is already well-formed
  let cleaned = text.trim();
  
  // Remove any common AI model preambles or postambles that might be present
  cleaned = cleaned
    .replace(/^(Here is|I've created|Below is|This is|The following is|Here's)[^]*?:/i, '')
    .replace(/^(\*\*|\*|#|##|###)\s*[a-zA-Z\s]+(Summary|Content|Text|Analysis)(\*\*|\*|#|##|###)/i, '')
    .replace(/(\*\*|\*|#|##|###)\s*(End|Conclusion|Summary|That's it)([^]*?)$/i, '')
    .trim();
  
  return cleaned || text;
}
