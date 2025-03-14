
import React from 'react';
import { SummarizationStyle } from '@/components/SettingsModal';

interface MinimalContentViewProps {
  content: string;
  isLoading: boolean;
  error: Error | null;
  style?: SummarizationStyle;
}

const MinimalContentView = ({ content, isLoading, error, style = 'standard' }: MinimalContentViewProps) => {
  if (isLoading) {
    return <div className="py-2 text-xs">Loading...</div>;
  }

  if (error) {
    return (
      <div className="py-2 text-xs">
        Error: {error.message}
      </div>
    );
  }

  if (!content) {
    return <div className="py-2 text-xs">No content available</div>;
  }

  // Process content to simplify formatting
  const processedContent = content
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '• $1')   // Convert italics to bullet points
    .replace(/#{1,6}\s*([^#\n]+)/g, '$1') // Remove heading markers
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 [$2]') // Simplify links to text [url]
    .replace(/`([^`]+)`/g, '$1')       // Remove code formatting
    .replace(/>\s*([^>\n]+)/g, '$1')   // Remove blockquotes
    .replace(/\n{3,}/g, '\n\n')        // Normalize excessive line breaks
    .trim();

  // Return plain text for minimal view to respect direct access settings
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <pre style={{ 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        padding: '0',
        margin: '0'
      }}>
        {processedContent}
      </pre>
    </div>
  );
};

export default MinimalContentView;
