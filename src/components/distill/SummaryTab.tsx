
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from "@/components/ui/use-toast";

interface SummaryTabProps {
  summary: string;
}

const SummaryTab = ({ summary }: SummaryTabProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Content Summary</CardTitle>
        {summary && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => copyToClipboard(summary)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {summary ? (
            <ReactMarkdown>{summary}</ReactMarkdown>
          ) : (
            <div className="py-4 text-amber-600">
              <p>No summary available yet. Please configure your OpenRouter API key in settings.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryTab;
