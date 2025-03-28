
import { StyleDefinition, StyleCategory } from './types';
import { normalizeStyleId } from './styleNormalizer';
import { IStyleDefinitionAdapter } from './IStyleDefinitionAdapter';
import { StyleDefinitionAdapter } from './StyleDefinitionAdapter';

/**
 * Service class for handling styles
 * Following the Open/Closed Principle - open for extension, closed for modification
 */
export class StyleService {
  private styleAdapter: IStyleDefinitionAdapter;
  
  /**
   * Create a new StyleService
   * @param adapter Optional style definition adapter
   */
  constructor(adapter?: IStyleDefinitionAdapter) {
    // Dependency injection allows for easy testing and extension
    this.styleAdapter = adapter || new StyleDefinitionAdapter();
  }
  
  /**
   * Get style definition by ID
   * @param styleId Style identifier
   * @returns Style definition
   */
  getStyleDefinition(styleId: string): StyleDefinition {
    // Normalize the styleId first
    const normalizedId = normalizeStyleId(styleId);
    
    // Use the adapter to get the definition
    return this.styleAdapter.getStyleDefinition(normalizedId);
  }

  /**
   * Get prompt modifier for a style if available
   * @param styleId Style identifier
   * @returns Prompt modifier string or undefined
   */
  getPromptModifier(styleId: string): string | undefined {
    const definition = this.getStyleDefinition(styleId);
    return definition?.promptModifier;
  }

  /**
   * Get all available style definitions
   * @param categoryFilter Optional category to filter by
   * @returns Array of style definitions
   */
  getAllStyles(categoryFilter?: StyleCategory): StyleDefinition[] {
    return this.styleAdapter.getAllStyles(categoryFilter);
  }

  /**
   * Gets recommended styles for display in the UI
   * @returns Array of recommended style definitions
   */
  getRecommendedStyles(): StyleDefinition[] {
    return this.styleAdapter.getRecommendedStyles();
  }
}

// Create a default instance for easy importing
export const defaultStyleService = new StyleService();
