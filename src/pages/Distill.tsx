import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { summarizeContent, summarizeUrl } from '@/utils/openRouter';
import { Copy, ArrowLeft } from 'lucide-react';
import { getSettings, getSummarizationStyleFromPath } from '@/utils/settings';
import { SummarizationStyle } from '@/components/SettingsModal';
import SettingsModal from "@/components/SettingsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';
import MinimalContentView from '@/components/MinimalContentView';

const Distill = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [originalContent, setOriginalContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isDirectAccess, setIsDirectAccess] = useState<boolean>(false);
  const [currentSummarizationStyle, setCurrentSummarizationStyle] = useState<SummarizationStyle>('standard');
  const [bulletCount, setBulletCount] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (location.pathname) {
      const { style, bulletCount } = getSummarizationStyleFromPath(location.pathname);
      setCurrentSummarizationStyle(style);
      setBulletCount(bulletCount);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    if (!url) return;

    const fetchContent = async () => {
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
              currentSummarizationStyle, 
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
                currentSummarizationStyle,
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
    
    fetchContent();
  }, [url, currentSummarizationStyle, bulletCount]);
  
  const copyToClipboard = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${what} copied to clipboard`,
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
  
  const handleBack = () => {
    navigate('/');
  };

  if (isDirectAccess) {
    return <MinimalContentView 
      content={summary} 
      isLoading={isLoading} 
      error={error} 
      style={currentSummarizationStyle}
    />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <SettingsModal />
      </div>
      
      {isLoading && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Fetching and processing content...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && !error && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="original">Original Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Content Summary</CardTitle>
                {summary && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(summary, 'Summary')}
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
          </TabsContent>
          
          <TabsContent value="original" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Original Content</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Source: <a href={`https://${url}`} target="_blank" rel="noopener noreferrer" className="underline">{url}</a>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(originalContent, 'Original content')}
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Distill;
