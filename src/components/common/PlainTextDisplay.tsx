
import React from 'react';

interface PlainTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * A component that displays content as plain text with proper formatting
 * for readability. Uses a pre tag with system font for better readability.
 */
const PlainTextDisplay = ({ content, className = '' }: PlainTextDisplayProps) => {
  if (!content || content.trim() === '') {
    return null;
  }
  
  // Additional cleanup to ensure proper bullet point formatting
  const formattedContent = content
    // Fix inconsistent bullet point formatting
    .replace(/•\s*([^•\n]+)/g, '• $1\n')
    // Ensure proper spacing after bullet points
    .replace(/•([^\s])/g, '• $1')
    // Fix nested bullet points that might be missing proper indentation
    .replace(/(\n\s*)•\s*/g, '$1  • ')
    // Clean up multiple line breaks
    .replace(/\n{3,}/g, '\n\n');
    
  return (
    <pre 
      style={{ 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        padding: '0',
        margin: '0'
      }}
      className={className}
    >
      {formattedContent}
    </pre>
  );
};

export default PlainTextDisplay;
