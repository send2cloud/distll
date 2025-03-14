
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { summarizeContent } from "@/utils/openRouter";
import { getSettings } from "@/utils/settings";
import SettingsModal from "@/components/SettingsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Distill = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [originalContent, setOriginalContent] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [progressStage, setProgressStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!url) {
      setError('No URL provided');
      setIsLoading(false);
      return;
    }

    const fetchAndDistill = async () => {
      try {
        setProgressStage(1); // Starting content fetch
        setProgress(10);
        
        // Step 1: Decode and format the URL
        let targetUrl = decodeURIComponent(url);
        if (!targetUrl.startsWith('http')) {
          targetUrl = `http://${targetUrl}`;
        }

        // Step 2: Fetch content using r.jina.com
        const jinaUrl = `https://r.jina.ai/${targetUrl}`;
        console.log('Fetching content from:', jinaUrl);
        
        setProgress(30);
        const contentResponse = await fetch(jinaUrl);
        
        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content: ${contentResponse.statusText}`);
        }
        
        setProgress(50);
        const contentText = await contentResponse.text();
        setOriginalContent(contentText);
        
        setProgressStage(2); // Starting summarization
        setProgress(60);
        
        // Step 3: Check if we have an API key before attempting summarization
        const settings = getSettings();
        if (!settings.openRouterApiKey) {
          setSummary("Please set your OpenRouter API key in settings to enable content summarization.");
          setIsLoading(false);
          setProgress(100);
          return;
        }
        
        // Step 4: Send to OpenRouter for summarization
        setProgress(70);
        const summaryText = await summarizeContent(contentText);
        setSummary(summaryText);
        
        setProgress(100);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(`Failed to process the URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
        setProgress(100);
        toast({
          title: "Error",
          description: `Failed to process the URL: ${err instanceof Error ? err.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    };

    fetchAndDistill();
  }, [url]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleBack} variant="outline" className="mb-4">
            ← Back to Home
          </Button>
          
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Processing {decodeURIComponent(url || '')}</span>
                <SettingsModal />
              </CardTitle>
              <CardDescription>
                {progressStage === 0 && "Preparing to process your URL..."}
                {progressStage === 1 && "Extracting content from the webpage..."}
                {progressStage === 2 && "Generating a summary of the content..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="w-full mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleBack} variant="outline" className="mb-4">
            ← Back to Home
          </Button>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Error</span>
                <SettingsModal />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleBack}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handleBack} variant="outline">
            ← Back to Home
          </Button>
          <SettingsModal />
        </div>
        
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="original">Original Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Distilled content from: {decodeURIComponent(url || '')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {summary || (
                    <div className="py-4 text-amber-600">
                      <p>No summary available yet. Please configure your OpenRouter API key in settings.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="original">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Original Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none overflow-auto max-h-[600px] border rounded p-4">
                  <pre className="whitespace-pre-wrap">{originalContent}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Distill;
