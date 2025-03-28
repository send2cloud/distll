
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
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a bullet list
      if (paragraph.trim().startsWith('•') || /^\d+\./.test(paragraph.trim())) {
        // Split the paragraph into individual bullet points
        const listItems = paragraph
          .split('\n')
          .filter(item => item.trim().length > 0)
          .map((item, itemIndex) => (
            <li key={`item-${index}-${itemIndex}`} className="ml-5 mb-1">{item.replace(/^[•\s]+|^\d+\.\s+/, '')}</li>
          ));
        
        // Determine if this is a numbered or bullet list
        const isNumberedList = /^\d+\./.test(paragraph.trim());
        
        return isNumberedList ? (
          <ol key={`list-${index}`} className="list-decimal mb-4 pl-4">{listItems}</ol>
        ) : (
          <ul key={`list-${index}`} className="list-disc mb-4 pl-4">{listItems}</ul>
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
