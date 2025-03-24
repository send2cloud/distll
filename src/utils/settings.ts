
import { SummarizationStyle, AIModel } from '@/types/settings';

// Return fixed default settings without using localStorage
export const getSettings = () => {
  return { 
    model: 'google/gemini-2.0-flash-thinking-exp:free' as AIModel
  };
};

export const getSummarizationStyleFromPath = (pathname: string): {style: string, bulletCount?: number} => {
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
    
    // Validate that the style is a valid SummarizationStyle
    const validStyles: SummarizationStyle[] = ['standard', 'simple', 'bullets', 'eli5', 'concise', 'tweet'];
    
    // If it's a predefined style, return it
    if (validStyles.includes(customStyle as SummarizationStyle)) {
      return { style: customStyle };
    }
    
    // If it's a custom style not in the predefined list, return the custom style
    return { style: customStyle };
  }
  
  // Default to standard style
  return { style: 'standard' };
};
