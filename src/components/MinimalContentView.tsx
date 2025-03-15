
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
  // Process content to simplify formatting if there is content
  const processedContent = content ? simplifyMarkdownText(content) : '';
  
  // Check if we actually have content after processing
  const hasActualContent = processedContent && processedContent.trim() !== '';

  // Check for loading, error, or empty states
  const showStateDisplay = isLoading || error || !hasActualContent;
  
  if (showStateDisplay) {
    return (
      <ContentStateDisplay 
        isLoading={isLoading}
        error={error}
        hasContent={hasActualContent}
        emptyMessage="No content available. Please check the URL or try a different page."
      />
    );
  }

  // Return plain text for minimal view to respect direct access settings
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PlainTextDisplay content={processedContent} />
    </div>
  );
};

export default MinimalContentView;
