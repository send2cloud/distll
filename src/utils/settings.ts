
import { parseStyleFromPath } from '@/services/styles/pathParser';

export const getSummarizationStyleFromPath = (pathname: string): {style: string, bulletCount?: number} => {
  // Use our style service to parse the path
  const { styleId, bulletCount } = parseStyleFromPath(pathname);
  
  return { 
    style: styleId, 
    bulletCount: bulletCount 
  };
};
