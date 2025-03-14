
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
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-red-500">Technical Details</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack || "No stack trace available"}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;
