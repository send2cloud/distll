
/**
 * Extracts content between special markers or returns the original text
 * @param text Text to process
 * @returns Cleaned text without markers
 */
export function extractContentBetweenMarkers(text: string): string {
  // Check if it contains the special "I cannot access this URL" message
  if (text.includes("I cannot access this URL") || text.includes("could not access")) {
    return "The content at this URL could not be accessed. Please check that the URL is correct and publicly accessible.";
  }
  
  // Basic cleaning - just return the text as-is
  return text;
}
