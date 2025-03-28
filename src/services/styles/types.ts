
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
