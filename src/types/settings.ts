
/**
 * Common types used across the application
 */

// Base type for summarization styles with common presets
export type SummarizationStyle = 'standard' | 'simple' | 'bullets' | 'eli5' | 'concise' | 'tweet' | 'clickbait' | 'seinfeld-standup';

// Type for AI models
export type AIModel = 
  | "google/gemini-2.5-pro-exp-03-25:free"
  | "google/gemini-2.0-flash-thinking-exp:free"
  | "google/gemini-2.0-flash-lite-preview-02-05:free"
  | "mistralai/mistral-small-3.1-24b-instruct:free";

// Any string can be used as a custom style
export type CustomSummarizationStyle = string;

// Export combined style type
export type AnyStyle = SummarizationStyle | CustomSummarizationStyle;
