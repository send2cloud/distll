
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
    return <div className="py-2 text-sm">{loadingMessage}</div>;
  }

  if (error) {
    return (
      <div className="py-2 text-sm text-red-600">
        Error: {errorMessage || error.message}
      </div>
    );
  }

  if (!hasContent) {
    return <div className="py-2 text-sm text-amber-600">{emptyMessage}</div>;
  }

  return null;
};

export default ContentStateDisplay;
