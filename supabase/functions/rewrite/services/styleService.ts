
/**
 * Service for parsing and handling style-related functionality
 * Following Single Responsibility Principle by focusing only on style handling
 */

/**
 * Extract style and URL information from a path
 */
export function parsePathInfo(path: string): { 
  styleId: string, 
  targetUrl: string,
  bulletCount?: number 
} {
  console.log(`Parsing path info: ${path}`);
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Check for bullet point number in URL path (e.g., /5/)
  const bulletMatch = cleanPath.match(/^(\d+)(?:\/|$)/);
  if (bulletMatch) {
    const bulletCount = parseInt(bulletMatch[1], 10);
    // Extract the URL which comes after the bullet count and slash
    const urlPart = cleanPath.substring(bulletMatch[0].length);
    return { 
      styleId: 'bullets', 
      bulletCount,
      targetUrl: urlPart
    };
  }
  
  // Check for custom style modifier (e.g., /seinfeld-standup/)
  const customStyleMatch = cleanPath.match(/^([a-zA-Z0-9_-]+)(?:\/|$)/);
  if (customStyleMatch) {
    const styleId = customStyleMatch[1].toLowerCase();
    // Extract the URL which comes after the style and slash
    const urlPart = cleanPath.substring(customStyleMatch[0].length);
    
    // Special case: if the style is "bullets" without a count, default to 5 bullets
    if (styleId === 'bullets') {
      return { 
        styleId, 
        bulletCount: 5,
        targetUrl: urlPart
      };
    }
    
    return { 
      styleId,
      targetUrl: urlPart
    };
  }
  
  // If no style/bullet info, the whole path is the URL
  return { 
    styleId: 'standard',
    targetUrl: cleanPath
  };
}

/**
 * Normalize a style ID for consistent handling
 */
export function normalizeStyleId(styleId: string): string {
  if (!styleId) return 'standard';
  
  const normalized = styleId.toLowerCase().trim();
  
  // Handle special cases and aliases
  const styleAliases: Record<string, string> = {
    'bullet': 'bullets',
    'bulletpoint': 'bullets',
    'bulletpoints': 'bullets',
    'bullet-point': 'bullets',
    'bullet-points': 'bullets',
    'eli': 'eli5',
    'eli-5': 'eli5',
    'explainlikeimfive': 'eli5',
    'explain-like-im-five': 'eli5',
    'seinfeld': 'seinfeld-standup',
    'jerry': 'seinfeld-standup',
    'jerryseinfeld': 'seinfeld-standup',
    'jerry-seinfeld': 'seinfeld-standup',
    'pirate': 'piratetalk',
    'piratesp': 'piratetalk',
    'pirates': 'piratetalk',
    'click': 'clickbait',
    'clickbaity': 'clickbait'
  };
  
  return styleAliases[normalized] || normalized;
}
