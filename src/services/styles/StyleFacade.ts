
import { StyleDefinition, StyleCategory } from './types';
import { normalizeStyleId } from './styleNormalizer';
import { StyleService } from './StyleService';
import { ExtendedStyleDefinitionAdapter } from './ExtendedStyleDefinitionAdapter';

/**
 * Facade that provides a simplified interface to all style functionality
 * Following the Interface Segregation Principle - clients only need to know about this interface
 */
export class StyleFacade {
  private styleService: StyleService;
  
  constructor() {
    // Use the extended adapter by default for better handling of custom styles
    const adapter = new ExtendedStyleDefinitionAdapter();
    this.styleService = new StyleService(adapter);
  }
  
  /**
   * Get style definition for any style ID, including dynamic custom styles
   * @param styleId Style identifier (can be any string)
   * @returns Style definition
   */
  getStyle(styleId: string): StyleDefinition {
    return this.styleService.getStyleDefinition(styleId);
  }
  
  /**
   * Get all available styles
   * @param category Optional category filter
   * @returns Array of style definitions
   */
  getAllStyles(category?: StyleCategory): StyleDefinition[] {
    return this.styleService.getAllStyles(category);
  }
  
  /**
   * Get recommended styles for the UI
   * @returns Array of recommended style definitions
   */
  getRecommendedStyles(): StyleDefinition[] {
    return this.styleService.getRecommendedStyles();
  }
  
  /**
   * Get prompt modifier for a style
   * @param styleId Style identifier
   * @returns Prompt modifier or undefined
   */
  getPromptModifier(styleId: string): string | undefined {
    return this.styleService.getPromptModifier(styleId);
  }
  
  /**
   * Normalize a style ID to handle variations
   * @param styleId Raw style ID
   * @returns Normalized style ID
   */
  normalizeStyleId(styleId: string): string {
    return normalizeStyleId(styleId);
  }
}

// Create a default instance for easy importing
export const styleFacade = new StyleFacade();
