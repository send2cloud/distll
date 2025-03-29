
/**
 * Extracts content between optional markdown markers
 * For when OpenAI adds extra context or headers/footers
 */
export function extractContentBetweenMarkers(content: string): string {
  if (!content) return '';
  
  // Look for markdown-style "```" code blocks that sometimes appear in responses
  const markdownMatch = content.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }

  // Look for common markdown headers and footers from AI models
  const noHeaderFooter = content
    .replace(/^#\s*(?:Summary|Content Summary|Article Summary)[\s\n]*/i, '')
    .replace(/\n+(?:In\s*conclusion|Overall|To\s*summarize)[^]*$/i, '')
    .trim();

  if (noHeaderFooter) {
    return noHeaderFooter;
  }

  // If no recognizable patterns, return the original
  return content;
}
