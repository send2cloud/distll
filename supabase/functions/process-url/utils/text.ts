
/**
 * Extract content between markdown markers
 * @param text Text that may contain markdown markers
 * @returns Cleaned text without markdown markers
 */
export function extractContentBetweenMarkers(text: string): string {
  // Check if text has the START/END markers
  if (text.includes('### START ###') && text.includes('### END ###')) {
    const start = text.indexOf('### START ###') + '### START ###'.length;
    const end = text.indexOf('### END ###');
    if (start < end) {
      return text.substring(start, end).trim();
    }
  }
  
  // If no markers or invalid markers, return the original text with some basic cleanup
  return text.replace(/^(\s*Here|I'll|This is|The following|Summary:|In summary)/i, '')
            .replace(/Let me know if you need.*$/i, '')
            .replace(/I hope this (helps|summary is helpful).*$/i, '')
            .replace(/^\s*#+\s*Summary\s*#+\s*/i, '')
            .trim();
}
