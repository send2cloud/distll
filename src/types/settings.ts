
/**
 * Available summarization styles for content
 * Can be any string that will be interpreted by the LLM
 */
export type SummarizationStyle = string;

/**
 * Available AI models for content processing
 */
export type AIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-instant' | 'claude-2' | 'mistral';
