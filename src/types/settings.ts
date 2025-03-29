
/**
 * Common types used across the application
 */

// Type for summarization styles
export type SummarizationStyle = 'standard' | 'simple' | 'bullets' | 'eli5' | 'concise' | 'tweet';

// Type for AI models
export type AIModel = 
  | "google/gemini-2.5-pro-exp-03-25:free"
  | "google/gemini-2.0-flash-thinking-exp:free"
  | "mistralai/mistral-small-3.1-24b-instruct:free";

// Allow for custom summarization styles as strings
export type CustomSummarizationStyle = string;
