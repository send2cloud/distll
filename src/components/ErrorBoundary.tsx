
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  connectionTestResult?: { success: boolean; error?: string };
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    this.testConnection();
  }

  private testConnection = async (): Promise<void> => {
    const result = await testSupabaseConnection();
    this.setState({ connectionTestResult: result });
  }

  private resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, connectionTestResult: undefined });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      const { error, connectionTestResult } = this.state;
      const isSupabaseError = error?.message.includes('supabase') || 
                            error?.message.includes('project not found') ||
                            error?.message.includes('function') ||
                            error?.message.includes('edge');
      
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4 text-red-600 font-medium">{error?.message || "An unexpected error occurred"}</p>
              
              {isSupabaseError && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800 font-medium mb-2">Supabase Connection Status:</p>
                  {connectionTestResult ? (
                    connectionTestResult.success ? (
                      <p className="text-sm text-green-600">✓ Connected to Supabase</p>
                    ) : (
                      <p className="text-sm text-red-600">⨯ Failed to connect: {connectionTestResult.error}</p>
                    )
                  ) : (
                    <p className="text-sm text-gray-600">Testing connection...</p>
                  )}
                  
                  <div className="mt-3 text-sm text-amber-700">
                    <p>This might be due to:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Incorrect Supabase project ID or API key</li>
                      <li>Edge function not deployed or misconfigured</li>
                      <li>Network connectivity issues</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">Technical Details</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                  {this.state.errorInfo?.componentStack || "No stack trace available"}
                </pre>
              </details>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-gray-50 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.testConnection}
                className="text-xs"
              >
                Recheck Connection
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={this.resetError}
                className="text-xs"
              >
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
