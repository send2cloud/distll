
import React from 'react';
import { SummarizationStyle } from '@/components/SettingsModal';
import PlainTextDisplay from '@/components/common/PlainTextDisplay';
import ContentStateDisplay from '@/components/common/ContentStateDisplay';
import { simplifyMarkdownText } from '@/utils/textFormatting';

interface MinimalContentViewProps {
  content: string;
  isLoading: boolean;
  error: Error | null;
  style?: SummarizationStyle;
}

/**
 * A minimal view component that displays content in a plain text format
 * for direct access or when rich formatting is not desired.
 */
const MinimalContentView = ({ content, isLoading, error, style = 'standard' }: MinimalContentViewProps) => {
  // Check for loading, error, or empty states
  if (isLoading || error || !content) {
    return (
      <ContentStateDisplay 
        isLoading={isLoading}
        error={error}
        hasContent={!!content}
      />
    );
  }

  // Process content to simplify formatting
  const processedContent = simplifyMarkdownText(content);

  // Return plain text for minimal view to respect direct access settings
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PlainTextDisplay content={processedContent} />
    </div>
  );
};

export default MinimalContentView;
