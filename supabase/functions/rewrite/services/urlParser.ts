
/**
 * Service responsible for parsing and normalizing URLs
 * Following the Single Responsibility Principle
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
  
  // Remove leading and trailing slashes if present
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
  console.log(`Cleaned path: ${cleanPath}`);
  
  // Handle empty path
  if (!cleanPath) {
    return { 
      styleId: 'standard',
      targetUrl: '' 
    };
  }
  
  // Check for bullet point number in URL path (e.g., /5/)
  const bulletMatch = cleanPath.match(/^(\d+)(?:\/|$)/);
  if (bulletMatch) {
    const bulletCount = parseInt(bulletMatch[1], 10);
    // Extract the URL which comes after the bullet count and slash
    const urlPart = cleanPath.substring(bulletMatch[0].length);
    console.log(`Extracted URL from bullet format: ${urlPart}`);
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
    console.log(`Extracted style: ${styleId}, URL: ${urlPart}`);
    
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
  console.log(`No style found, treating entire path as URL: ${cleanPath}`);
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

/**
 * Ensure URL has a protocol prefix
 */
export function ensureProtocol(url: string): string {
  if (!url) return url;
  
  // Check if URL already has a protocol
  if (url.match(/^[a-zA-Z]+:\/\//)) {
    return url;
  }
  
  // Add https:// prefix
  return `https://${url}`;
}

/**
 * Clean and format URL for processing
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Decode URL components
  try {
    url = decodeURIComponent(url);
  } catch (e) {
    console.log("URL decoding failed, using raw URL");
  }
  
  // Handle rewrite.page prefix if present
  if (url.includes('rewrite.page/')) {
    const matches = url.match(/rewrite\.page\/(\d+)?\/?(.+)/);
    if (matches && matches[2]) {
      url = matches[2];
    }
  }
  
  return ensureProtocol(url);
}
