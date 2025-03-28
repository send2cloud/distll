
/**
 * Normalize style ID by converting various formats to a standardized format
 * @param styleInput Raw style input from URL or user
 * @returns Normalized style ID
 */
export const normalizeStyleId = (styleInput: string): string => {
  if (!styleInput) return 'standard';
  
  // Convert to lowercase and remove special characters
  let normalized = styleInput.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special chars except hyphen and underscore
    .replace(/\s+/g, '-');        // Replace spaces with hyphens
  
  // Handle common aliases and variations
  const commonAliases: Record<string, string> = {
    // Format variations
    'bullet': 'bullets',
    'bulletpoints': 'bullets',
    'bullet-points': 'bullets',
    'bulletpoint': 'bullets',
    
    // ELI5 variations
    'explain-like-im-5': 'eli5',
    'explainlikeimfive': 'eli5',
    'explain-like-im-five': 'eli5',
    'explainlikeim5': 'eli5',
    
    // Tweet variations
    'twitter': 'tweet',
    'twitter-style': 'tweet',
    'tweet-style': 'tweet',
    'tweetstyle': 'tweet',
    
    // Special case for Seinfeld standup
    'seinfieldstandupjoke': 'seinfeld-standup',
    'seinfield-standup-joke': 'seinfeld-standup',
    'seinfeld-joke': 'seinfeld-standup',
    'seinfeld-standup-joke': 'seinfeld-standup',
    'seinfeld': 'seinfeld-standup',
    'jerry-seinfeld': 'seinfeld-standup',
    
    // Exec summary variations
    'executive': 'executivesummary',
    'exec-summary': 'executivesummary',
    'executive-summary': 'executivesummary',
    'business-summary': 'executivesummary',
  };
  
  // Check if we have a direct alias match
  if (commonAliases[normalized]) {
    return commonAliases[normalized];
  }
  
  // If no matching alias, return the normalized version
  return normalized;
};

/**
 * Format a style ID into a readable name
 * @param styleId Style identifier to format
 * @returns Formatted style name
 */
export const formatStyleName = (styleId: string): string => {
  if (!styleId) return 'Standard';
  
  // Convert hyphens to spaces and capitalize each word
  return styleId
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
