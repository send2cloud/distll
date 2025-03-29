
import React from 'react';

interface PlainTextDisplayProps {
  content: string;
  className?: string;
  asPlainText?: boolean;
}

/**
 * A component that displays content as plain text without any special formatting.
 * Can display as true plain text (no styling at all) or with minimal styling.
 */
const PlainTextDisplay = ({ content, className = '', asPlainText = false }: PlainTextDisplayProps) => {
  // Check if we have any content to display
  const hasContent = content && content.trim().length > 0;
  
  if (!hasContent) {
    return (
      <div className="text-muted-foreground p-4 text-center border border-amber-200 bg-amber-50 rounded-md font-sans">
        No content available to display.
      </div>
    );
  }
  
  // For true plain text display with absolutely no styling
  if (asPlainText) {
    return (
      <div 
        style={{ 
          fontFamily: '"Noto Sans", sans-serif', 
          whiteSpace: 'pre-wrap',
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'none',
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#000'
        }}
        data-testid="plain-text-content"
      >
        {content}
      </div>
    );
  }
  
  // Minimal styling approach
  return (
    <pre 
      className={`whitespace-pre-wrap break-words font-sans text-base leading-relaxed p-0 m-0 ${className}`}
    >
      {content}
    </pre>
  );
};

export default PlainTextDisplay;
