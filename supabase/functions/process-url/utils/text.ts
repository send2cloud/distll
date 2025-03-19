
/**
 * Extracts content between markers in the text or returns the original text
 * @param text The text to process
 * @returns The cleaned text
 */
export function extractContentBetweenMarkers(text: string): string {
  if (!text) return '';
  
  // If the text appears to be HTML (contains HTML tags), try to extract meaningful content
  if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('<body')) {
    console.log('Text appears to be HTML, attempting to extract content');
    
    try {
      // Extract text from body tag if present
      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        const bodyText = bodyMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
          .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
          .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
          .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ');
          
        return bodyText.trim();
      }
      
      // Fallback: just strip all HTML tags
      const strippedText = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ');
        
      return strippedText.trim();
    } catch (error) {
      console.error('Error while extracting content from HTML:', error);
    }
  }
  
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
