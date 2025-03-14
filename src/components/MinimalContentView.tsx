
import React from 'react';
import ReactMarkdown from 'react-markdown';
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

  // Return plain text for minimal view to respect direct access settings
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <pre style={{ 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-word',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.5',
        padding: '0',
        margin: '0'
      }}>
        {content}
      </pre>
    </div>
  );
};

export default MinimalContentView;
