
import React from 'react';
import { SummarizationStyle } from '@/components/SettingsModal';
import PlainTextDisplay from '@/components/common/PlainTextDisplay';
import ContentStateDisplay from '@/components/common/ContentStateDisplay';
import { simplifyMarkdownText, cleanTextFormatting } from '@/utils/textFormatting';

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
  // First check if we have any usable content
  const hasRawContent = Boolean(content && content.trim() !== '');
  
  // Apply comprehensive text cleaning and formatting
  const processedContent = hasRawContent ? simplifyMarkdownText(content) : '';
  
  // Check if we still have valid content after processing
  const hasActualContent = Boolean(processedContent && processedContent.trim() !== '');

  // Show loading/error states or empty content message
  if (isLoading || error || !hasActualContent) {
    return (
      <ContentStateDisplay 
        isLoading={isLoading}
        error={error}
        hasContent={hasActualContent}
        emptyMessage="No content available. Please check the URL or try a different page."
      />
    );
  }

  // Return properly formatted content
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PlainTextDisplay content={processedContent} />
    </div>
  );
};

export default MinimalContentView;
