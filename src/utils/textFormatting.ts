
/**
 * Convert content to formatted markdown text
 * This function is now simpler since we're embracing markdown
 */
export const preserveBasicFormatting = (content: string): string => {
  if (!content) return '';
  
  // Clean up any artifacts from JSON or other formatting
  let cleaned = content
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
 * Now calls preserveBasicFormatting to allow markdown formatting
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
 * when no markers are present, preserving markdown formatting
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
  
  // If no markers found, just clean the text with markdown formatting preserved
  return preserveBasicFormatting(text);
};
