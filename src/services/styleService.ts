
import { SummarizationStyle, CustomSummarizationStyle } from '@/types/settings';

/**
 * StyleCategory type for organizing styles
 */
export type StyleCategory = 'format' | 'tone' | 'audience' | 'length' | 'special' | 'language' | 'custom';

/**
 * Interface for style definition with metadata
 */
export interface StyleDefinition {
  id: string;
  name: string;
  description: string;
  category: StyleCategory;
  examples?: string[];
  promptModifier?: string;
  isPreset: boolean;
}

/**
 * Comprehensive mapping of styles with rich metadata
 */
const STYLE_DEFINITIONS: Record<string, StyleDefinition> = {
  // Format styles
  'standard': {
    id: 'standard',
    name: 'Standard',
    description: 'Concise, clear summary of key points',
    category: 'format',
    isPreset: true
  },
  'bullets': {
    id: 'bullets',
    name: 'Bullet Points',
    description: 'Key points presented as bullet points',
    category: 'format',
    examples: ['5', '10', 'bullets'],
    isPreset: true
  },
  
  // Tone styles
  'simple': {
    id: 'simple',
    name: 'Simple',
    description: 'Easy-to-understand language with short sentences',
    category: 'tone',
    isPreset: true
  },
  'eli5': {
    id: 'eli5',
    name: 'Explain Like I\'m 5',
    description: 'Explains content as if to a five-year-old',
    category: 'audience',
    examples: ['eli5', 'explain-like-im-5', 'simple-explanation'],
    isPreset: true
  },
  'concise': {
    id: 'concise',
    name: 'Concise',
    description: 'Ultra-compact summary of essential points',
    category: 'length',
    isPreset: true
  },
  'tweet': {
    id: 'tweet',
    name: 'Tweet',
    description: 'Summary in 140 characters or less',
    category: 'length',
    examples: ['tweet', 'twitter'],
    isPreset: true
  },
  'clickbait': {
    id: 'clickbait',
    name: 'Clickbait',
    description: 'Attention-grabbing sensationalist style',
    category: 'tone',
    isPreset: true
  },
  
  // Special styles - examples of custom styles that could be added
  'seinfeld-standup': {
    id: 'seinfeld-standup',
    name: 'Seinfeld Standup',
    description: 'In the style of Jerry Seinfeld\'s observational comedy',
    category: 'special',
    examples: ['seinfeld', 'seinfeld-joke', 'jerry-standup'],
    promptModifier: 'Write in the style of Jerry Seinfeld doing observational comedy standup, with his characteristic "What's the deal with..." format and exaggerated observations.',
    isPreset: false
  },
  'tamil': {
    id: 'tamil',
    name: 'Tamil',
    description: 'Summary in Tamil language',
    category: 'language',
    isPreset: false
  },
  'executivesummary': {
    id: 'executivesummary',
    name: 'Executive Summary',
    description: 'Professional summary for business leaders',
    category: 'format',
    examples: ['executive', 'business-summary', 'exec'],
    isPreset: false
  }
};

/**
 * Normalize style ID by converting various formats to a standardized format
 * @param styleInput Raw style input from URL or user
 * @returns Normalized style ID
 */
export const normalizeStyleId = (styleInput: string): string => {
  if (!styleInput) return 'standard';
  
  // Convert to lowercase and remove special characters
  let normalized = styleInput.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special chars except hyphen and underscore
    .replace(/\s+/g, '-');        // Replace spaces with hyphens
  
  // Handle common aliases and variations
  const commonAliases: Record<string, string> = {
    // Format variations
    'bullet': 'bullets',
    'bulletpoints': 'bullets',
    'bullet-points': 'bullets',
    'bulletpoint': 'bullets',
    
    // ELI5 variations
    'explain-like-im-5': 'eli5',
    'explainlikeimfive': 'eli5',
    'explain-like-im-five': 'eli5',
    'explainlikeim5': 'eli5',
    
    // Tweet variations
    'twitter': 'tweet',
    'twitter-style': 'tweet',
    'tweet-style': 'tweet',
    'tweetstyle': 'tweet',
    
    // Special case for Seinfeld standup
    'seinfieldstandupjoke': 'seinfeld-standup',
    'seinfield-standup-joke': 'seinfeld-standup',
    'seinfeld-joke': 'seinfeld-standup',
    'seinfeld-standup-joke': 'seinfeld-standup',
    'seinfeld': 'seinfeld-standup',
    'jerry-seinfeld': 'seinfeld-standup',
    
    // Exec summary variations
    'executive': 'executivesummary',
    'exec-summary': 'executivesummary',
    'executive-summary': 'executivesummary',
    'business-summary': 'executivesummary',
  };
  
  // Check if we have a direct alias match
  if (commonAliases[normalized]) {
    return commonAliases[normalized];
  }
  
  // Check for compound style phrases (e.g., "funny eli5")
  // This would require more sophisticated logic in a full implementation
  
  // If no matching alias, return the normalized version or check if it's in our definitions
  return STYLE_DEFINITIONS[normalized] ? normalized : normalized;
}

/**
 * Get style definition by ID
 * @param styleId Style identifier
 * @returns Style definition or undefined if not found
 */
export const getStyleDefinition = (styleId: string): StyleDefinition | undefined => {
  // Normalize the styleId first
  const normalizedId = normalizeStyleId(styleId);
  
  // Return the definition if it exists
  return STYLE_DEFINITIONS[normalizedId] || {
    id: normalizedId,
    name: formatStyleName(normalizedId),
    description: `Custom ${formatStyleName(normalizedId)} style`,
    category: 'custom',
    isPreset: false
  };
}

/**
 * Format a style ID into a readable name
 * @param styleId Style identifier to format
 * @returns Formatted style name
 */
export const formatStyleName = (styleId: string): string => {
  if (!styleId) return 'Standard';
  
  // Convert hyphens to spaces and capitalize each word
  return styleId
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get prompt modifier for a style if available
 * @param styleId Style identifier
 * @returns Prompt modifier string or undefined
 */
export const getPromptModifier = (styleId: string): string | undefined => {
  const definition = getStyleDefinition(styleId);
  return definition?.promptModifier;
}

/**
 * Get all available style definitions
 * @param categoryFilter Optional category to filter by
 * @returns Array of style definitions
 */
export const getAllStyles = (categoryFilter?: StyleCategory): StyleDefinition[] => {
  const styles = Object.values(STYLE_DEFINITIONS);
  
  if (categoryFilter) {
    return styles.filter(style => style.category === categoryFilter);
  }
  
  return styles;
}

/**
 * Gets recommended styles for display in the UI
 * @returns Array of recommended style definitions
 */
export const getRecommendedStyles = (): StyleDefinition[] => {
  // These are the styles we want to promote in the UI
  const recommendedStyleIds = [
    'simple', 'eli5', 'bullets', 'concise', 'tweet', 
    'clickbait', 'seinfeld-standup', 'tamil', 'executivesummary'
  ];
  
  return recommendedStyleIds
    .map(id => STYLE_DEFINITIONS[id])
    .filter(Boolean);
}

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
  // Check for bullet point number in URL path (e.g., /5/)
  const bulletMatch = pathname.match(/^\/(\d+)\//);
  if (bulletMatch) {
    const bulletCount = parseInt(bulletMatch[1], 10);
    return { 
      styleId: 'bullets', 
      bulletCount, 
      isBulletStyle: true 
    };
  }
  
  // Check for custom style modifier (e.g., /seinfeld-standup/)
  const customStyleMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)\//);
  if (customStyleMatch) {
    const rawStyle = customStyleMatch[1].toLowerCase();
    const normalizedStyleId = normalizeStyleId(rawStyle);
    
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
  return { 
    styleId: 'standard', 
    isBulletStyle: false 
  };
};
