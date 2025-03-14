
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
  const getStyleLabel = (style: SummarizationStyle): string => {
    switch (style) {
      case 'simple': return 'Simple English';
      case 'bullets': return 'Bullet Points';
      case 'eli5': return 'Explain Like I\'m 5';
      case 'concise': return 'Concise';
      case 'tweet': return 'Tweet';
      default: return 'Standard';
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error.message}</p>
        {error.message.includes("OpenRouter API key") && (
          <p className="mt-4">
            Please set your OpenRouter API key in the settings to use this feature.
          </p>
        )}
      </div>
    );
  }

  if (!content) {
    return <div className="py-8 text-center">No content available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {style !== 'standard' && (
        <div className="mb-4 text-sm text-muted-foreground bg-muted inline-block px-2 py-1 rounded">
          {getStyleLabel(style)} view
        </div>
      )}
      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MinimalContentView;
