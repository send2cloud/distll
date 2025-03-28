
import React from 'react';

interface PlainTextDisplayProps {
  content: string;
  className?: string;
  asPlainText?: boolean;
}

/**
 * A component that displays content with basic formatting elements preserved.
 * Can display with minimal styling or as completely plain text.
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
  
  // Process content to add proper formatting for React
  const formatContent = () => {
    // First, normalize line endings and ensure consistent spacing
    const normalizedContent = content.replace(/\r\n/g, '\n');
    
    // Split by double newlines for paragraphs
    const paragraphs = normalizedContent.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Enhanced detection for bullet and numbered lists
      const isBulletList = paragraph.includes('\n• ') || paragraph.trim().startsWith('• ');
      const isNumberedList = /\d+\.\s/.test(paragraph) || paragraph.includes('\n1. ');
      
      if (isBulletList || isNumberedList) {
        // Split the paragraph into individual list items
        const listItems = paragraph
          .split('\n')
          .filter(item => item.trim().length > 0)
          .map((item, itemIndex) => {
            // Extract the actual content without the bullet or number
            const content = item.replace(/^[•\s]+|^\d+\.\s+/, '').trim();
            return (
              <li key={`item-${index}-${itemIndex}`} className="ml-5 mb-2">
                {content}
              </li>
            );
          });
        
        return isNumberedList ? (
          <ol key={`list-${index}`} className="list-decimal mb-6 pl-4 space-y-1">
            {listItems}
          </ol>
        ) : (
          <ul key={`list-${index}`} className="list-disc mb-6 pl-4 space-y-1">
            {listItems}
          </ul>
        );
      }
      
      // Regular paragraph
      return <p key={`para-${index}`} className="mb-4">{paragraph}</p>;
    });
  };
  
  // Render with formatting
  return (
    <div className={`font-sans text-base leading-relaxed ${className}`}>
      {formatContent()}
    </div>
  );
};

export default PlainTextDisplay;
