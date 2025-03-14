
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MinimalContentViewProps {
  content: string;
  isLoading: boolean;
  error: Error | null;
}

const MinimalContentView = ({ content, isLoading, error }: MinimalContentViewProps) => {
  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!content) {
    return <div className="py-8 text-center">No content available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 prose prose-sm md:prose-base lg:prose-lg dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MinimalContentView;
