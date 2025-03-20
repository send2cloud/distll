
import { SummarizationStyle } from "@/contexts/SettingsContext";

// Return fixed default settings without using localStorage
export const getSettings = () => {
  return { 
    summarizationStyle: 'standard' as SummarizationStyle
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
    return { style: customStyle };
  }
  
  // Default to standard style
  return { style: 'standard' };
};
