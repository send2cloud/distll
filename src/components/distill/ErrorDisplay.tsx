
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react'; // Using lucide-react instead as it's already installed

interface ErrorDisplayProps {
  error: Error;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  // Check if the error might be related to URL format
  const isUrlError = error.message.includes("fetch") || 
                     error.message.includes("URL") || 
                     error.message.includes("network");
  
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">{error.message}</p>
        
        {isUrlError && (
          <Alert className="mt-2 border-amber-200 bg-amber-50">
            <AlertTitle className="text-amber-800">URL Format Tip</AlertTitle>
            <AlertDescription className="text-amber-700">
              Make sure your URL is correctly formatted. Try prefixing it with a summarization style 
              like "/eli5/" or "/simple/" (e.g., /eli5/arstechnica.com/article-path/).
            </AlertDescription>
          </Alert>
        )}
        
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
