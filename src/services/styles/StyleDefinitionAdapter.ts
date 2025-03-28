
import { StyleDefinition, StyleCategory } from './types';
import { STYLE_DEFINITIONS } from './styleDefinitions';
import { formatStyleName } from './styleNormalizer';
import { IStyleDefinitionAdapter } from './IStyleDefinitionAdapter';

/**
 * Adapter implementation for style definitions
 * Following the Single Responsibility Principle - this class is only responsible for style definitions
 */
export class StyleDefinitionAdapter implements IStyleDefinitionAdapter {
  /**
   * Get a style definition by ID
   * @param styleId Style identifier
   * @returns Style definition
   */
  getStyleDefinition(styleId: string): StyleDefinition {
    // Return the predefined definition if it exists
    if (STYLE_DEFINITIONS[styleId]) {
      return STYLE_DEFINITIONS[styleId];
    }
    
    // Create a dynamic definition for custom styles
    return {
      id: styleId,
      name: formatStyleName(styleId),
      description: `Custom ${formatStyleName(styleId)} style`,
      category: 'custom',
      isPreset: false
    };
  }

  /**
   * Get all available style definitions
   * @param categoryFilter Optional category to filter by
   * @returns Array of style definitions
   */
  getAllStyles(categoryFilter?: StyleCategory): StyleDefinition[] {
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
  getRecommendedStyles(): StyleDefinition[] {
    // These are the styles we want to promote in the UI
    const recommendedStyleIds = [
      'simple', 'eli5', 'bullets', 'concise', 'tweet', 
      'clickbait', 'seinfeld-standup', 'tamil', 'executivesummary'
    ];
    
    return recommendedStyleIds
      .map(id => STYLE_DEFINITIONS[id])
      .filter(Boolean);
  }
}
