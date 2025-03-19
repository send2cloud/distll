
/**
 * Convert content to plain text format with minimal formatting
 * for all display types
 */
export const simplifyToPlainText = (content: string): string => {
  if (!content) return '';
  
  // Apply comprehensive cleaning to create a plain text representation
  let cleaned = content;
  
  // Remove markdown formatting
  cleaned = cleaned
    .replace(/#{1,6}\s+([^\n]+)/g, '$1\n\n')  // Convert headings to text with spacing
    .replace(/\*\*([^*]+)\*\*/g, '$1')         // Remove bold
    .replace(/\*([^*]+)\*/g, '$1')             // Remove italics
    .replace(/`([^`]+)`/g, '$1')               // Remove code formatting
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Convert links to just text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')    // Remove images
    .replace(/>\s*([^>\n]+)/g, '$1\n')         // Convert blockquotes to plain text
    .replace(/\n\s*[-*+]\s+/g, '\n• ')         // Standardize bullet points
    .replace(/\n\s*\d+\.\s+/g, '\n• ')         // Convert numbered lists to bullet points
    .replace(/\n{3,}/g, '\n\n')                // Normalize multiple line breaks
    .replace(/\s{2,}/g, ' ');                  // Normalize spaces
  
  // Clean up any artifacts from JSON or other formatting
  cleaned = cleaned
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '    ');
  
  // Remove any START or END tags that may have been left
  cleaned = cleaned
    .replace(/#{1,3}\s*START\s*#{1,3}/gi, '')
    .replace(/#{1,3}\s*END\s*#{1,3}/gi, '')
    .replace(/\bSTART\b\s*#{1,3}/gi, '')
    .replace(/\bEND\b\s*#{1,3}/gi, '')
    .replace(/^START\s+/gi, '')
    .replace(/\s+END$/gi, '');
  
  return cleaned.trim();
};

/**
 * Legacy function maintained for backward compatibility
 * Now just calls simplifyToPlainText
 */
export const simplifyMarkdownText = (content: string): string => {
  return simplifyToPlainText(content);
};

/**
 * Comprehensive text cleaner that handles various formatting issues
 * Now just calls simplifyToPlainText for consistency
 */
export const cleanTextFormatting = (text: string): string => {
  return simplifyToPlainText(text);
};

/**
 * Extract content between specific markers or clean up content
 * when no markers are present
 */
export const extractContentBetweenMarkers = (text: string, startMarker: string = 'START', endMarker: string = 'END'): string => {
  if (!text) return '';
  
  // Try to find content between markers with various formats
  const patterns = [
    new RegExp(`#{1,3}\\s*${startMarker}\\s*#{1,3}([\\s\\S]*?)#{1,3}\\s*${endMarker}\\s*#{1,3}`, 'i'),
    new RegExp(`${startMarker}([\\s\\S]*?)${endMarker}`, 'i'),
    new RegExp(`\\b${startMarker}\\b\\s*([\\s\\S]*)`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim()) {
      return simplifyToPlainText(match[1]);
    }
  }
  
  // If no markers found, just clean the text
  return simplifyToPlainText(text);
};
