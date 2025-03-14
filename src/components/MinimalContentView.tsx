
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

  // Return just the raw markdown content with basic styling for readability
  return (
    <div className="font-mono text-sm whitespace-pre-wrap">
      {content}
    </div>
  );
};

export default MinimalContentView;
