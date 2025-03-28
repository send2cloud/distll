
import { SummarizationStyle, AIModel } from '@/types/settings';
import { parseStyleFromPath } from '@/services/styleService';

// Return fixed default settings without using localStorage
export const getSettings = () => {
  return { 
    model: 'google/gemini-2.5-pro-exp-03-25:free' as AIModel
  };
};

export const getSummarizationStyleFromPath = (pathname: string): {style: string, bulletCount?: number} => {
  // Use our new style service to parse the path
  const { styleId, bulletCount } = parseStyleFromPath(pathname);
  
  return { 
    style: styleId, 
    bulletCount: bulletCount 
  };
};
