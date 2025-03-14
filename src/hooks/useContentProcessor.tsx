
import { useState, useEffect } from 'react';
import { summarizeContent, summarizeUrl } from '@/utils/openRouter';
import { getSettings } from '@/utils/settings';
import { SummarizationStyle } from '@/components/SettingsModal';
import { toast } from "@/components/ui/use-toast";

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
    if (!url) return;

    console.log("Processing content with style:", style, "and bullet count:", bulletCount);

    const processContent = async () => {
      setIsLoading(true);
      setError(null);
      setProgress(10);
      
      try {
        const decodedUrl = decodeURIComponent(url);
        const fullUrl = decodedUrl.startsWith('http') ? decodedUrl : `https://${decodedUrl}`;
        
        setProgress(20);
        
        const settings = getSettings();
        
        if (settings.useDirectUrlSummarization) {
          setProgress(40);
          try {
            const summaryText = await summarizeUrl(
              fullUrl, 
              style, 
              bulletCount
            );
            setSummary(summaryText);
            setOriginalContent("Content fetched directly by OpenRouter API");
            setProgress(100);
          } catch (summaryError) {
            console.error('Error summarizing URL directly:', summaryError);
            throw summaryError;
          }
        } else {
          const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`);
          
          setProgress(50);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch content: ${response.statusText}`);
          }
          
          const html = await response.text();
          setProgress(70);
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const scripts = doc.querySelectorAll('script, style, svg, iframe, img, noscript');
          scripts.forEach(script => script.remove());
          
          const article = doc.querySelector('article') || 
                          doc.querySelector('main') || 
                          doc.querySelector('.content') || 
                          doc.querySelector('.article') ||
                          doc.querySelector('.post') ||
                          doc.body;
          
          const mainContent = article?.textContent || doc.body.textContent || '';
          
          const cleanContent = mainContent
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 15000);
          
          setOriginalContent(cleanContent);
          setProgress(80);
          
          if (settings.openRouterApiKey) {
            try {
              const summaryText = await summarizeContent(
                cleanContent,
                style,
                bulletCount
              );
              setSummary(summaryText);
            } catch (summaryError) {
              console.error('Error summarizing content:', summaryError);
              toast({
                title: "Summarization Error",
                description: summaryError instanceof Error ? summaryError.message : "Failed to summarize content",
                variant: "destructive"
              });
            }
          }
          
          setProgress(100);
        }
      } catch (fetchError) {
        console.error('Error fetching content:', fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error('Unknown error occurred'));
        toast({
          title: "Error",
          description: fetchError instanceof Error ? fetchError.message : "Failed to fetch content",
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
