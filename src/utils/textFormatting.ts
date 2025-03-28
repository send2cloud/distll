
/**
 * Convert content to formatted text that preserves basic formatting elements
 * while removing complex markdown and other unwanted formatting
 */
export const preserveBasicFormatting = (content: string): string => {
  if (!content) return '';
  
  // Apply cleaning that preserves paragraph breaks, bullets, and numbered lists
  let cleaned = content;
  
  // Remove markdown formatting but preserve structure
  cleaned = cleaned
    .replace(/#{1,6}\s+([^\n]+)/g, '$1\n\n')  // Convert headings to text with spacing
    .replace(/\*\*([^*]+)\*\*/g, '$1')         // Remove bold
    .replace(/\*([^*]+)\*/g, '$1')             // Remove italics
    .replace(/`([^`]+)`/g, '$1')               // Remove code formatting
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Convert links to just text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')    // Remove images
    .replace(/>\s*([^>\n]+)/g, '$1\n')         // Convert blockquotes to plain text
    
    // Preserve and standardize bullet points and numbered lists
    .replace(/\n\s*[-*]\s+/g, '\n• ')          // Standardize bullet points
    .replace(/\n\s*(\d+)\.\s+/g, '\n$1. ')     // Preserve numbered lists
    
    // Basic cleanup - preserve reasonable line breaks
    .replace(/\n{4,}/g, '\n\n\n')              // Normalize multiple line breaks (max 3)
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
 * Now calls preserveBasicFormatting to allow basic formatting
 */
export const simplifyToPlainText = (content: string): string => {
  return preserveBasicFormatting(content);
};

/**
 * Legacy function maintained for backward compatibility
 * Now just calls preserveBasicFormatting
 */
export const simplifyMarkdownText = (content: string): string => {
  return preserveBasicFormatting(content);
};

/**
 * Comprehensive text cleaner that handles various formatting issues
 * Now calls preserveBasicFormatting for consistency
 */
export const cleanTextFormatting = (text: string): string => {
  return preserveBasicFormatting(text);
};

/**
 * Extract content between specific markers or clean up content
 * when no markers are present, preserving basic formatting
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
      return preserveBasicFormatting(match[1]);
    }
  }
  
  // If no markers found, just clean the text with basic formatting preserved
  return preserveBasicFormatting(text);
};
