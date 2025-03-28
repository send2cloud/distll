
import { StyleDefinition } from './types';
import { normalizeStyleId, formatStyleName } from './styleNormalizer';

/**
 * Service for handling custom styles that aren't predefined
 * Following the Single Responsibility Principle - this class only handles custom styles
 */
export class CustomStyleProvider {
  private customStyles: Map<string, StyleDefinition>;
  
  constructor() {
    this.customStyles = new Map();
  }
  
  /**
   * Get a custom style definition
   * @param styleId Style identifier
   * @returns Custom style definition or undefined if not found
   */
  getCustomStyle(styleId: string): StyleDefinition | undefined {
    const normalizedId = normalizeStyleId(styleId);
    return this.customStyles.get(normalizedId);
  }
  
  /**
   * Create a custom style definition for a style not in the predefined list
   * @param styleId Style identifier
   * @returns New style definition
   */
  createCustomStyle(styleId: string): StyleDefinition {
    const normalizedId = normalizeStyleId(styleId);
    
    // Create a new style definition
    const newStyle: StyleDefinition = {
      id: normalizedId,
      name: formatStyleName(normalizedId),
      description: `Custom ${formatStyleName(normalizedId)} style`,
      category: 'custom',
      isPreset: false
    };
    
    // Store it for future reference
    this.customStyles.set(normalizedId, newStyle);
    
    return newStyle;
  }
  
  /**
   * Get or create a custom style
   * @param styleId Style identifier
   * @returns Style definition
   */
  getOrCreateCustomStyle(styleId: string): StyleDefinition {
    const existingStyle = this.getCustomStyle(styleId);
    if (existingStyle) {
      return existingStyle;
    }
    
    return this.createCustomStyle(styleId);
  }
  
  /**
   * Get all custom styles
   * @returns Array of custom style definitions
   */
  getAllCustomStyles(): StyleDefinition[] {
    return Array.from(this.customStyles.values());
  }
}

// Create a default instance for easy importing
export const defaultCustomStyleProvider = new CustomStyleProvider();
