
import React from 'react';
import ContentTab from './ContentTab';
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface OriginalContentTabProps {
  originalContent: string;
  url: string;
}

/**
 * A component that displays the original content with a link to the source
 * and allows copying to clipboard
 */
const OriginalContentTab = ({ originalContent, url }: OriginalContentTabProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Original content copied to clipboard",
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

  // Format URL correctly based on what we received
  const displayUrl = url.startsWith('http') ? url : 
                      url.includes('://') ? url : 
                      `https://${url}`;

  return (
    <ContentTab 
      title="Original Content"
      headerActions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => copyToClipboard(originalContent)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      }
    >
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Source: <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="underline">{url}</a>
        </p>
        <div className="max-h-[500px] overflow-y-auto border rounded-md p-4 bg-muted/40">
          <p className="whitespace-pre-line">{originalContent}</p>
        </div>
      </div>
    </ContentTab>
  );
};

export default OriginalContentTab;
