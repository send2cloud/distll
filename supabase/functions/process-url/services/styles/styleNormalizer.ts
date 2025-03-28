
/**
 * Normalize a style ID to ensure consistent handling across the application
 * 
 * @param styleId Raw style ID from user input or URL
 * @returns Normalized style ID
 */
export const normalizeStyleId = (styleId: string): string => {
  if (!styleId) return 'standard';
  
  const normalized = styleId.toLowerCase().trim();
  
  // Handle special cases and aliases
  switch (normalized) {
    case 'bullet':
    case 'bulletpoint':
    case 'bulletpoints':
    case 'bullet-point':
    case 'bullet-points':
      return 'bullets';
      
    case '5':
    case '5bullets':
    case '5-bullets':
    case '5bullet':
    case '5-bullet':
      return 'bullets'; // Will default to 5 bullets in pathParser
      
    case 'eli':
    case 'eli-5':
    case 'eli5':
    case 'explainlikeimfive':
    case 'explain-like-im-five':
      return 'eli5';
      
    case 'seinfeld':
    case 'jerry':
    case 'jerryseinfeld':
    case 'jerry-seinfeld':
      return 'seinfeld-standup';
      
    case 'pirate':
    case 'piratesp':
    case 'pirates':
      return 'piratetalk';
      
    case 'click':
    case 'clickbaity':
      return 'clickbait';
      
    default:
      return normalized;
  }
};
