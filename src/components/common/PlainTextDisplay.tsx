
import React from 'react';

interface PlainTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * A component that displays content as plain text without any special formatting.
 * Uses native browser text rendering capabilities.
 */
const PlainTextDisplay = ({ content, className = '' }: PlainTextDisplayProps) => {
  // Check if we have any content to display
  const hasContent = content && content.trim().length > 0;
  
  if (!hasContent) {
    return (
      <div className="text-muted-foreground p-4 text-center border border-amber-200 bg-amber-50 rounded-md">
        No content available to display.
      </div>
    );
  }
  
  return (
    <pre 
      className={`whitespace-pre-wrap break-words font-sans text-base leading-relaxed p-0 m-0 ${className}`}
    >
      {content}
    </pre>
  );
};

export default PlainTextDisplay;
