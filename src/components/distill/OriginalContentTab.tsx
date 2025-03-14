
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface OriginalContentTabProps {
  originalContent: string;
  url: string;
}

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Original Content</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Source: <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="underline">{url}</a>
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => copyToClipboard(originalContent)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto border rounded-md p-4 bg-muted/40">
          <p className="whitespace-pre-line">{originalContent}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OriginalContentTab;
