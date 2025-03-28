
import { StyleDefinition, StyleCategory } from './types';
import { STYLE_DEFINITIONS } from './styleDefinitions';
import { normalizeStyleId, formatStyleName } from './styleNormalizer';
import { parseStyleFromPath } from './pathParser';

/**
 * Get style definition by ID
 * @param styleId Style identifier
 * @returns Style definition or undefined if not found
 */
export const getStyleDefinition = (styleId: string): StyleDefinition => {
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
};

/**
 * Get prompt modifier for a style if available
 * @param styleId Style identifier
 * @returns Prompt modifier string or undefined
 */
export const getPromptModifier = (styleId: string): string | undefined => {
  const definition = getStyleDefinition(styleId);
  return definition?.promptModifier;
};

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
};

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
};

// Export everything from the module for backward compatibility
export * from './types';
export * from './styleNormalizer';
export * from './pathParser';
