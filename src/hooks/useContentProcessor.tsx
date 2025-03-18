
import { useState, useEffect } from 'react';
import { getSettings } from '@/utils/settings';
import { SummarizationStyle } from '@/components/SettingsModal';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentProcessorResult {
  originalContent: string;
  summary: string;
  isLoading: boolean;
  error: Error | null;
  progress: number;
}

export const useContentProcessor = (
  url: string | undefined, 
  style: SummarizationStyle,
  bulletCount?: number
): ContentProcessorResult => {
  const [originalContent, setOriginalContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      setError(new Error("No URL provided"));
      return;
    }

    console.log("Processing content with style:", style, "and bullet count:", bulletCount);

    const processContent = async () => {
      setIsLoading(true);
      setError(null);
      setSummary(''); // Reset summary to avoid showing stale content
      setOriginalContent(''); // Reset original content
      setProgress(10);
      
      try {
        // Normalize URL to ensure it has a proper protocol prefix
        let decodedUrl = decodeURIComponent(url);
        decodedUrl = decodedUrl.trim();
        
        if (!decodedUrl) {
          throw new Error("URL is empty after decoding");
        }
        
        // Ensure the URL has a protocol prefix
        const fullUrl = decodedUrl.startsWith('http') ? decodedUrl : `https://${decodedUrl}`;
        
        console.log("Processing URL:", fullUrl, "with style:", style, "and bullet count:", bulletCount);
        setProgress(20);
        
        const settings = getSettings();
        
        // Call the Supabase Edge Function to process the URL
        setProgress(40);
        
        try {
          const { data, error } = await supabase.functions.invoke('process-url', {
            body: {
              url: fullUrl,
              style: style,
              bulletCount: bulletCount,
              openRouterApiKey: settings.openRouterApiKey
            }
          });
          
          if (error) {
            console.error('Error calling process-url function:', error);
            throw new Error(`Edge function error: ${error.message || "Unknown error"}`);
          }
          
          if (!data) {
            throw new Error("No data returned from edge function");
          }
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setProgress(80);
          
          if (!data.summary || data.summary.trim() === '') {
            throw new Error("Received empty summary from API");
          }
          
          setSummary(data.summary);
          setOriginalContent(data.originalContent);
          setProgress(100);
        } catch (apiError) {
          console.error('Error processing URL with edge function:', apiError);
          throw apiError;
        }
      } catch (error) {
        console.error('Error in content processing:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to process content",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    processContent();
  }, [url, style, bulletCount]);

  return { originalContent, summary, isLoading, error, progress };
};
