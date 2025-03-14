
/**
 * Processes markdown content to create simplified, plain text output
 * Converts to a more readable format with simple bullet points and links
 */
export const simplifyMarkdownText = (content: string): string => {
  if (!content) return '';
  
  return content
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '• $1')   // Convert italics to bullet points
    .replace(/#{1,6}\s*([^#\n]+)/g, '$1') // Remove heading markers
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 [$2]') // Simplify links to text [url]
    .replace(/`([^`]+)`/g, '$1')       // Remove code formatting
    .replace(/>\s*([^>\n]+)/g, '$1')   // Remove blockquotes
    .replace(/\n{3,}/g, '\n\n')        // Normalize excessive line breaks
    .trim();
};
