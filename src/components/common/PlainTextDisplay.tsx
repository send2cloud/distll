
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
      {content}
    </pre>
  );
};

export default PlainTextDisplay;
