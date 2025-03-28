
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface PlainTextDisplayProps {
  content: string;
  className?: string;
  asPlainText?: boolean;
}

/**
 * A component that displays content with markdown formatting.
 * Can display with markdown styling or as completely plain text.
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
  
  // Render using ReactMarkdown to handle the markdown formatting
  return (
    <div className={`font-sans text-base leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          // Customize rendering of different markdown elements
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc mb-6 pl-6 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal mb-6 pl-6 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default PlainTextDisplay;
