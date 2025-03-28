
/**
 * Extract content between markdown markers, preserving markdown formatting
 * @param text Text that may contain markdown markers
 * @returns Cleaned text with markdown preserved
 */
export function extractContentBetweenMarkers(text: string): string {
  if (!text) return '';
  
  // Check if text has the START/END markers
  if (text.includes('### START ###') && text.includes('### END ###')) {
    const start = text.indexOf('### START ###') + '### START ###'.length;
    const end = text.indexOf('### END ###');
    if (start < end) {
      return text.substring(start, end).trim();
    }
  }
  
  // Try other common marker patterns
  const markerPatterns = [
    { start: '```markdown', end: '```' },
    { start: 'Summary:', end: null },
    { start: 'Here is the summary:', end: null },
    { start: 'Here\'s your', end: null }
  ];
  
  for (const pattern of markerPatterns) {
    if (text.includes(pattern.start)) {
      const startIdx = text.indexOf(pattern.start) + pattern.start.length;
      const endIdx = pattern.end ? text.indexOf(pattern.end, startIdx) : text.length;
      
      if (endIdx > startIdx) {
        return text.substring(startIdx, endIdx).trim();
      }
    }
  }
  
  // If no markers found, return the original text with some basic cleanup
  // but preserve markdown formatting and do not force list format
  return text.replace(/^(\s*Here|I'll|This is|The following|Summary:|In summary)/i, '')
            .replace(/Let me know if you need.*$/i, '')
            .replace(/I hope this (helps|summary is helpful).*$/i, '')
            .replace(/^\s*#+\s*Summary\s*#+\s*/i, '')
            .trim();
}
