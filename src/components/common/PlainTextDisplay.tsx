
import React from 'react';
import { cleanTextFormatting } from '@/utils/textFormatting';

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
    return (
      <div className="text-muted-foreground p-4 text-center">
        No content available to display.
      </div>
    );
  }
  
  // Clean and format the content for better readability
  const formattedContent = cleanTextFormatting(content);
  
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
