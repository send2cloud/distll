
import React from 'react';
import ContentTab from './ContentTab';
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from "@/components/ui/use-toast";

interface SummaryTabProps {
  summary: string;
}

/**
 * A component that displays the summarized content with markdown formatting
 * and allows copying to clipboard
 */
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

  const copyButton = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => copyToClipboard(summary)}
    >
      <Copy className="h-4 w-4 mr-1" />
      Copy
    </Button>
  );

  return (
    <ContentTab 
      title="Content Summary"
      headerActions={summary ? copyButton : undefined}
    >
      <div className="prose max-w-none">
        {summary ? (
          <ReactMarkdown>{summary}</ReactMarkdown>
        ) : (
          <div className="py-4 text-amber-600">
            <p>No summary available yet. Please configure your OpenRouter API key in settings.</p>
          </div>
        )}
      </div>
    </ContentTab>
  );
};

export default SummaryTab;
