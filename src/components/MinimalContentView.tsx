
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlainTextDisplay from '@/components/common/PlainTextDisplay';
import ErrorDisplay from '@/components/distill/ErrorDisplay';
import LoadingIndicator from '@/components/distill/LoadingIndicator';
import { styleFacade } from '@/services/styles';
import ContentStateDisplay from './common/ContentStateDisplay';

interface MinimalContentViewProps {
  content: string;
  isLoading: boolean;
  error: Error | null;
  style?: string;
  progress?: number;
  onRetry?: () => void;
}

/**
 * A minimal view for displaying content with loading and error states
 */
const MinimalContentView = ({ 
  content, 
  isLoading, 
  error, 
  style = 'standard',
  progress = 0,
  onRetry 
}: MinimalContentViewProps) => {
  // Get style definition from the style service
  const styleDef = styleFacade.getStyle(style);
  
  return (
    <div className="flex flex-col items-center p-4 h-full bg-white">
      <div className="flex flex-col w-full max-w-2xl mx-auto mt-6">
        {/* Title area */}
        <div className="mb-6 flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            {styleDef.name} Summary
          </h1>
        </div>
        
        {/* Content area */}
        <div className="w-full">
          {isLoading ? (
            <LoadingIndicator message="Summarizing content..." progress={progress} />
          ) : error ? (
            <ErrorDisplay error={error} onRetry={onRetry} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{styleDef.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {content ? (
                  <PlainTextDisplay content={content} />
                ) : (
                  <ContentStateDisplay 
                    isLoading={false} 
                    error={null} 
                    hasContent={false} 
                    emptyMessage="No content to display" 
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalContentView;
