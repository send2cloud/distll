
import { SummarizationStyle } from "@/types/settings";

// Return fixed default settings without using localStorage
export const getSettings = () => {
  return { 
    summarizationStyle: 'standard' as SummarizationStyle
  };
};

export const getSummarizationStyleFromPath = (pathname: string): {style: SummarizationStyle, bulletCount?: number} => {
  // Check for bullet point number in URL path
  const bulletMatch = pathname.match(/^\/(\d+)\//);
  if (bulletMatch) {
    const bulletCount = parseInt(bulletMatch[1], 10);
    return { style: 'bullets', bulletCount };
  }
  
  // Check for custom style modifier
  const customStyleMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)\//);
  if (customStyleMatch) {
    const customStyle = customStyleMatch[1].toLowerCase();
    
    // Validate that the style is one of the allowed SummarizationStyle values
    if (isValidSummarizationStyle(customStyle)) {
      return { style: customStyle };
    }
  }
  
  // Default to standard style
  return { style: 'standard' };
};

// Helper function to validate if a string is a valid SummarizationStyle
function isValidSummarizationStyle(style: string): style is SummarizationStyle {
  return ['standard', 'simple', 'bullets', 'eli5', 'concise', 'tweet'].includes(style);
}
