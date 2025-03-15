
/**
 * Processes markdown content to create simplified, plain text output
 * Converts to a more readable format with simple bullet points and links
 */
export const simplifyMarkdownText = (content: string): string => {
  if (!content) return '';
  
  // Apply comprehensive cleaning to remove unwanted elements
  let cleaned = cleanTextFormatting(content);
  
  return cleaned
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '• $1')   // Convert italics to bullet points
    .replace(/#{1,6}\s*([^#\n]+)/g, '$1') // Remove heading markers
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 [$2]') // Simplify links to text [url]
    .replace(/`([^`]+)`/g, '$1')       // Remove code formatting
    .replace(/>\s*([^>\n]+)/g, '$1')   // Remove blockquotes
    .replace(/\n{3,}/g, '\n\n')        // Normalize excessive line breaks
    .trim();
};

/**
 * Comprehensive text cleaner that handles various formatting issues
 * from AI responses and other structured content
 */
export const cleanTextFormatting = (text: string): string => {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove non-Latin script at the beginning (like "रेझोर,Colorado")
  cleaned = cleaned.replace(/^[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF]+[.,\s]*/g, '');
  
  // Remove any START or END tags in various formats
  cleaned = cleaned.replace(/#{1,3}\s*START\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/#{1,3}\s*END\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/\bSTART\b\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/\bEND\b\s*#{1,3}/gi, '');
  
  // Handle any START or END patterns without hashes
  cleaned = cleaned.replace(/^START\s+/gi, '');
  cleaned = cleaned.replace(/\s+END$/gi, '');
  
  // Remove any repeated START or END patterns in the middle of text
  cleaned = cleaned.replace(/\bSTART\b\s*/gi, '');
  cleaned = cleaned.replace(/\s*\bEND\b/gi, '');
  
  // Normalize bullet points for consistent formatting
  cleaned = cleaned
    .replace(/•\s*([^•\n]+)/g, '• $1\n')
    .replace(/•([^\s])/g, '• $1')
    .replace(/(\n\s*)•\s*/g, '$1  • ');
  
  // Clean up multiple consecutive line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
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
      return cleanTextFormatting(match[1]);
    }
  }
  
  // If no markers found, just clean the text
  return cleanTextFormatting(text);
};
