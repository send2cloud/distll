
import { StyleDefinition, StyleCategory } from './types';
import { STYLE_DEFINITIONS } from './styleDefinitions';
import { formatStyleName } from './styleNormalizer';
import { IStyleDefinitionAdapter } from './IStyleDefinitionAdapter';
import { CustomStyleProvider, defaultCustomStyleProvider } from './CustomStyleProvider';

/**
 * Enhanced adapter implementation for style definitions that handles custom styles
 * Following the Liskov Substitution Principle - this class can replace the basic adapter
 */
export class ExtendedStyleDefinitionAdapter implements IStyleDefinitionAdapter {
  private customStyleProvider: CustomStyleProvider;
  
  /**
   * Create a new ExtendedStyleDefinitionAdapter
   * @param customStyleProvider Optional custom style provider
   */
  constructor(customStyleProvider?: CustomStyleProvider) {
    this.customStyleProvider = customStyleProvider || defaultCustomStyleProvider;
  }
  
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
    
    // Try to get from custom styles
    return this.customStyleProvider.getOrCreateCustomStyle(styleId);
  }

  /**
   * Get all available style definitions
   * @param categoryFilter Optional category to filter by
   * @returns Array of style definitions
   */
  getAllStyles(categoryFilter?: StyleCategory): StyleDefinition[] {
    const predefinedStyles = Object.values(STYLE_DEFINITIONS);
    const customStyles = this.customStyleProvider.getAllCustomStyles();
    
    // Combine both sources
    const allStyles = [...predefinedStyles, ...customStyles];
    
    if (categoryFilter) {
      return allStyles.filter(style => style.category === categoryFilter);
    }
    
    return allStyles;
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
