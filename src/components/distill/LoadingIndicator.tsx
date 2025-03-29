
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  progress: number;
}

const LoadingIndicator = ({ progress }: LoadingIndicatorProps) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">Fetching and processing content...</p>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default LoadingIndicator;
