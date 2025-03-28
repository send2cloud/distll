
/**
 * Extract content between markdown markers, preserving markdown formatting
 * @param text Text that may contain markdown markers
 * @returns Cleaned text with markdown preserved
 */
export function extractContentBetweenMarkers(text: string): string {
  if (!text) return '';
  
  // Handle null, undefined or empty text
  if (text === null || text === undefined || text.trim() === '') {
    return '';
  }
  
  try {
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
    let cleanedText = text.replace(/^(\s*Here|I'll|This is|The following|Summary:|In summary)/i, '')
              .replace(/Let me know if you need.*$/i, '')
              .replace(/I hope this (helps|summary is helpful).*$/i, '')
              .replace(/^\s*#+\s*Summary\s*#+\s*/i, '')
              .trim();
    
    // Make sure any leftover START/END markers are removed with more comprehensive patterns
    cleanedText = cleanedText
      .replace(/#{1,3}\s*START\s*#{1,3}/gi, '')
      .replace(/#{1,3}\s*END\s*#{1,3}/gi, '')
      .replace(/\bSTART\b\s*#{1,3}/gi, '')
      .replace(/\bEND\b\s*#{1,3}/gi, '')
      .replace(/^START\s+/gi, '')
      .replace(/\s+END$/gi, '')
      .replace(/START\s*$/gi, '')
      .replace(/^\s*END/gi, '');
      
    return cleanedText.trim();
  } catch (error) {
    // If any error occurs during text processing, log it and return a safe empty string
    console.error("Error extracting content between markers:", error);
    return '';
  }
}
