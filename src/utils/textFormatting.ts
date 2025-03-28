/**
 * Convert content to formatted markdown text
 * This function is now simpler since we're embracing markdown
 */
export const preserveBasicFormatting = (content: string): string => {
  // Handle null, undefined or empty content
  if (!content || typeof content !== 'string') return '';
  
  try {
    // Clean up any artifacts from JSON or other formatting
    let cleaned = content
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '    ');
    
    // More comprehensive regex to remove any START or END tags that may have been left
    cleaned = cleaned
      .replace(/#{1,3}\s*START\s*#{1,3}/gi, '')
      .replace(/#{1,3}\s*END\s*#{1,3}/gi, '')
      .replace(/\bSTART\b\s*#{1,3}/gi, '')
      .replace(/\bEND\b\s*#{1,3}/gi, '')
      .replace(/^START\s+/gi, '')
      .replace(/\s+END$/gi, '')
      .replace(/\s*#{1,3}\s*START\s*#{1,3}\s*/gi, '') 
      .replace(/\s*#{1,3}\s*END\s*#{1,3}\s*/gi, '')
      .replace(/START\s*$/gi, '')
      .replace(/^\s*END/gi, '');
    
    return cleaned.trim();
  } catch (error) {
    console.error("Error in preserveBasicFormatting:", error);
    return content || ''; // Return original content or empty string if formatting fails
  }
};

/**
 * Legacy function maintained for backward compatibility
 * Now calls preserveBasicFormatting to allow markdown formatting
 */
export const simplifyToPlainText = (content: string): string => {
  if (!content) return '';
  try {
    return preserveBasicFormatting(content);
  } catch (error) {
    console.error("Error in simplifyToPlainText:", error);
    return content || '';
  }
};

/**
 * Legacy function maintained for backward compatibility
 * Now just calls preserveBasicFormatting
 */
export const simplifyMarkdownText = (content: string): string => {
  if (!content) return '';
  try {
    return preserveBasicFormatting(content);
  } catch (error) {
    console.error("Error in simplifyMarkdownText:", error);
    return content || '';
  }
};

/**
 * Comprehensive text cleaner that handles various formatting issues
 * Now calls preserveBasicFormatting for consistency
 */
export const cleanTextFormatting = (text: string): string => {
  if (!text) return '';
  try {
    return preserveBasicFormatting(text);
  } catch (error) {
    console.error("Error in cleanTextFormatting:", error);
    return text || '';
  }
};

/**
 * Extract content between specific markers or clean up content
 * when no markers are present, preserving markdown formatting
 */
export const extractContentBetweenMarkers = (text: string, startMarker: string = 'START', endMarker: string = 'END'): string => {
  if (!text) return '';
  
  try {
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
  } catch (error) {
    console.error("Error in extractContentBetweenMarkers:", error);
    return text || '';
  }
};
