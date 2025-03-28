
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  progress: number;
  message?: string;
}

const LoadingIndicator = ({ progress, message = "Fetching and processing content..." }: LoadingIndicatorProps) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">{message}</p>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default LoadingIndicator;
