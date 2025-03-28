
import { StyleDefinition } from './types';

/**
 * Comprehensive mapping of styles with rich metadata
 */
export const STYLE_DEFINITIONS: Record<string, StyleDefinition> = {
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
    promptModifier: 'Write in the style of Jerry Seinfeld doing observational comedy standup, with his characteristic "What\'s the deal with..." format and exaggerated observations.',
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
