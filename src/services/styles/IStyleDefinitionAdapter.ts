
import { StyleDefinition, StyleCategory } from './types';

/**
 * Interface defining a style definition adapter
 * This follows the Dependency Inversion Principle by depending on abstractions
 */
export interface IStyleDefinitionAdapter {
  /**
   * Get a style definition for a specific style ID
   * @param styleId The style identifier
   * @returns A style definition
   */
  getStyleDefinition(styleId: string): StyleDefinition;
  
  /**
   * Get all available style definitions
   * @param categoryFilter Optional category filter
   * @returns Array of style definitions
   */
  getAllStyles(categoryFilter?: StyleCategory): StyleDefinition[];
  
  /**
   * Get recommended styles for display in the UI
   * @returns Array of recommended style definitions
   */
  getRecommendedStyles(): StyleDefinition[];
}
