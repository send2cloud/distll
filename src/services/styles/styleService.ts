
import { StyleDefinition, StyleCategory } from './types';
import { StyleService, defaultStyleService } from './StyleService';
import { normalizeStyleId, formatStyleName } from './styleNormalizer';
import { parseStyleFromPath } from './pathParser';

// Re-export everything for backward compatibility
export * from './types';
export * from './styleNormalizer';
export * from './pathParser';

/**
 * Get style definition by ID
 * @param styleId Style identifier
 * @returns Style definition or undefined if not found
 */
export const getStyleDefinition = (styleId: string): StyleDefinition => {
  return defaultStyleService.getStyleDefinition(styleId);
};

/**
 * Get prompt modifier for a style if available
 * @param styleId Style identifier
 * @returns Prompt modifier string or undefined
 */
export const getPromptModifier = (styleId: string): string | undefined => {
  return defaultStyleService.getPromptModifier(styleId);
};

/**
 * Get all available style definitions
 * @param categoryFilter Optional category to filter by
 * @returns Array of style definitions
 */
export const getAllStyles = (categoryFilter?: StyleCategory): StyleDefinition[] => {
  return defaultStyleService.getAllStyles(categoryFilter);
};

/**
 * Gets recommended styles for display in the UI
 * @returns Array of recommended style definitions
 */
export const getRecommendedStyles = (): StyleDefinition[] => {
  return defaultStyleService.getRecommendedStyles();
};

// Export the StyleService class for direct usage
export { StyleService };
