
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
        
        if (settings.useDirectUrlSummarization) {
          setProgress(40);
          try {
            const summaryText = await summarizeUrl(
              fullUrl, 
              style, 
              bulletCount
            );
            
            if (!summaryText || summaryText.trim() === '') {
              throw new Error("Received empty response from summarization API");
            }
            
            setSummary(summaryText);
            setOriginalContent("Content fetched directly by OpenRouter API");
            setProgress(100);
          } catch (summaryError) {
            console.error('Error summarizing URL directly:', summaryError);
            throw summaryError;
          }
        } else {
          try {
            // Use CORS proxy to fetch content
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`);
            
            setProgress(50);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            
            if (!html || html.trim() === '') {
              throw new Error("Received empty content from URL");
            }
            
            setProgress(70);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove non-content elements
            const scripts = doc.querySelectorAll('script, style, svg, iframe, img, noscript');
            scripts.forEach(script => script.remove());
            
            // Try to find the main content
            const article = doc.querySelector('article') || 
                            doc.querySelector('main') || 
                            doc.querySelector('.content') || 
                            doc.querySelector('.article') ||
                            doc.querySelector('.post') ||
                            doc.body;
            
            if (!article) {
              throw new Error("Could not identify main content in the page");
            }
            
            const mainContent = article.textContent || doc.body.textContent || '';
            
            if (!mainContent || mainContent.trim() === '') {
              throw new Error("Extracted content is empty");
            }
            
            const cleanContent = mainContent
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 15000);
            
            if (!cleanContent || cleanContent.trim() === '') {
              throw new Error("Content was empty after cleaning");
            }
            
            setOriginalContent(cleanContent);
            setProgress(80);
            
            if (settings.openRouterApiKey) {
              try {
                console.log("Sending to summarizeContent with bullet count:", bulletCount);
                const summaryText = await summarizeContent(
                  cleanContent,
                  style,
                  bulletCount
                );
                
                if (!summaryText || summaryText.trim() === '') {
                  throw new Error("Received empty summary from API");
                }
                
                setSummary(summaryText);
              } catch (summaryError) {
                console.error('Error summarizing content:', summaryError);
                toast({
                  title: "Summarization Error",
                  description: summaryError instanceof Error ? summaryError.message : "Failed to summarize content",
                  variant: "destructive"
                });
                
                // Even if summarization fails, we still have original content
                if (!summary) {
                  setSummary(`Summarization failed. Original content: \n\n${cleanContent.substring(0, 500)}...`);
                }
              }
            } else {
              // No API key, use original content as summary
              setSummary("API key not configured. Here's the extracted content:\n\n" + cleanContent.substring(0, 1000) + "...");
            }
            
            setProgress(100);
          } catch (fetchError) {
            console.error('Error fetching/processing content:', fetchError);
            throw fetchError;
          }
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
