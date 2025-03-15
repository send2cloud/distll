
/**
 * Processes markdown content to create simplified, plain text output
 * Converts to a more readable format with simple bullet points and links
 */
export const simplifyMarkdownText = (content: string): string => {
  if (!content) return '';
  
  // First clean up any non-Latin script at the beginning (similar to openRouter.ts)
  let cleaned = content.replace(/^[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF]+[.,\s]*/g, '');
  
  // Remove any START or END tags
  cleaned = cleaned.replace(/#{1,3}\s*START\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/#{1,3}\s*END\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/\bSTART\b\s*#{1,3}/gi, '');
  cleaned = cleaned.replace(/\bEND\b\s*#{1,3}/gi, '');
  
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
