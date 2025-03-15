
import React from 'react';

interface ContentStateDisplayProps {
  isLoading: boolean;
  error: Error | null;
  hasContent: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
}

/**
 * A component that displays different states (loading, error, empty)
 * for content-based components
 */
const ContentStateDisplay = ({ 
  isLoading, 
  error, 
  hasContent,
  loadingMessage = 'Loading...',
  errorMessage,
  emptyMessage = 'No content available'
}: ContentStateDisplayProps) => {
  if (isLoading) {
    return <div className="py-4 px-4 text-sm bg-blue-50 border border-blue-200 rounded-md">{loadingMessage}</div>;
  }

  if (error) {
    return (
      <div className="py-4 px-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
        Error: {errorMessage || error.message}
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="py-4 px-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
        {emptyMessage}
        <p className="mt-2 text-xs">
          Try a different URL or check if the URL is accessible and contains readable content.
        </p>
      </div>
    );
  }

  return null;
};

export default ContentStateDisplay;
