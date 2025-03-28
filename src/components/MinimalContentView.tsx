
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContentStateDisplay from '@/components/common/ContentStateDisplay';
import PlainTextDisplay from '@/components/common/PlainTextDisplay';
import ErrorDisplay from '@/components/distill/ErrorDisplay';
import LoadingIndicator from '@/components/distill/LoadingIndicator';
import { styleFacade } from '@/services/styles';

interface MinimalContentViewProps {
  content: string;
  isLoading: boolean;
  error: Error | null;
  style: string;
  onRetry?: () => void;
}

const MinimalContentView = ({ content, isLoading, error, style, onRetry }: MinimalContentViewProps) => {
  const styleDef = styleFacade.getStyle(style);
  
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Show error state */}
        {error && <ErrorDisplay error={error} onRetry={onRetry} />}
        
        {/* Show loading state */}
        {isLoading && !error && <LoadingIndicator />}
        
        {/* Show content when available */}
        {!isLoading && !error && (
          <>
            <Card className="mb-6 border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                  <styleDef.icon className="w-5 h-5 mr-2 text-gray-600" />
                  {styleDef.name} Summary
                </CardTitle>
                {styleDef.description && (
                  <CardDescription className="text-gray-500">
                    {styleDef.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {content ? (
                  <PlainTextDisplay text={content} />
                ) : (
                  <ContentStateDisplay message="No content to display" />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MinimalContentView;
