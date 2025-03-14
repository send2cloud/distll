
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: Error;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700">Error</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600">{error.message}</p>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
