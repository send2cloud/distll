
/**
 * Parse style information from the URL path
 * @param pathname URL path to parse 
 * @returns Object with normalized style and other parameters
 */
export const parseStyleFromPath = (pathname: string): { 
  styleId: string, 
  bulletCount?: number,
  isBulletStyle: boolean
} => {
  console.log(`Parsing style from path: ${pathname}`);
  
  // Remove any leading slashes for consistent parsing
  const cleanPath = pathname.replace(/^\/+/, '');
  
  // Check for bullet point number in URL path (e.g., /5/)
  const bulletMatch = cleanPath.match(/^(\d+)(?:\/|$)/);
  if (bulletMatch) {
    const bulletCount = parseInt(bulletMatch[1], 10);
    console.log(`Found bullet style with count: ${bulletCount}`);
    return { 
      styleId: 'bullets', 
      bulletCount, 
      isBulletStyle: true 
    };
  }
  
  // Check for custom style modifier (e.g., /seinfeld-standup/)
  const customStyleMatch = cleanPath.match(/^([a-zA-Z0-9_-]+)(?:\/|$)/);
  if (customStyleMatch) {
    const rawStyle = customStyleMatch[1].toLowerCase();
    const normalizedStyleId = normalizeStyleId(rawStyle);
    
    console.log(`Found custom style: ${rawStyle}, normalized to: ${normalizedStyleId}`);
    
    // Special case: if the normalized style is bullets, but doesn't have a count
    // we'll default to 5 bullets
    if (normalizedStyleId === 'bullets') {
      return { 
        styleId: normalizedStyleId, 
        bulletCount: 5, 
        isBulletStyle: true 
      };
    }
    
    return { 
      styleId: normalizedStyleId, 
      isBulletStyle: normalizedStyleId === 'bullets' 
    };
  }
  
  // Default to standard style
  console.log('No style found, using standard style');
  return { 
    styleId: 'standard', 
    isBulletStyle: false 
  };
};

import { normalizeStyleId } from './styleNormalizer.ts';
