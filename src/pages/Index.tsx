
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import SettingsModal from "@/components/SettingsModal";
import { Workflow, MilestoneIcon, Users, LineChart } from 'lucide-react';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [customStyle, setCustomStyle] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the current path contains a URL to process
  useEffect(() => {
    const path = location.pathname;
    if (path.length > 1) { // If there's anything after the root "/"
      const targetUrl = path.substring(1); // Remove the leading "/"
      processUrl(targetUrl);
    }
  }, [location.pathname]);

  const validateUrl = (input: string) => {
    try {
      // Add http:// if missing
      const urlToCheck = input.startsWith('http') ? input : `http://${input}`;
      new URL(urlToCheck);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUrl(input);
    setIsValidUrl(validateUrl(input));
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomStyle(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    // Process URL without http:// prefix to match URL routing pattern
    let processableUrl = url;
    if (processableUrl.startsWith('http://')) {
      processableUrl = processableUrl.substring(7);
    } else if (processableUrl.startsWith('https://')) {
      processableUrl = processableUrl.substring(8);
    }

    // If a custom style is provided, include it in the path
    if (customStyle.trim()) {
      navigate(`/${customStyle.trim()}/${processableUrl}`);
    } else {
      navigate(`/${processableUrl}`);
    }
  };

  const processUrl = (targetUrl: string) => {
    // Navigate directly to the URL without the /distill/ prefix
    navigate(`/${encodeURIComponent(targetUrl)}`);
  };

  const handleStyleClick = (style: string) => {
    if (isValidUrl) {
      // Process URL without http:// prefix to match URL routing pattern
      let processableUrl = url;
      if (processableUrl.startsWith('http://')) {
        processableUrl = processableUrl.substring(7);
      } else if (processableUrl.startsWith('https://')) {
        processableUrl = processableUrl.substring(8);
      }
      
      navigate(`/${style}/${processableUrl}`);
    } else {
      setCustomStyle(style);
      toast({
        title: "Style selected",
        description: `"${style}" style will be applied when you enter a valid URL`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] font-sans">
      {/* Navigation section */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#221F26]">Distill</div>
        <div className="flex items-center space-x-2">
          <SettingsModal />
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-[#221F26]">Strategy guides content</h1>
        <p className="text-2xl text-[#403E43] mb-8 max-w-3xl mx-auto">
          Distill is the fit-for-purpose tool for extracting and summarizing content from any web page.
        </p>
        
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter URL (e.g., example.com/article)"
                    value={url}
                    onChange={handleInputChange}
                    className="flex-1 border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
                  />
                  <Button 
                    type="submit" 
                    disabled={!isValidUrl}
                    className="bg-[#221F26] hover:bg-[#403E43]"
                  >
                    Distill
                  </Button>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-[#8A898C] mb-2 text-left">
                    Optional: Apply a custom style or perspective
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Custom style (e.g., clickbait, academic, etc.)"
                      value={customStyle}
                      onChange={handleStyleChange}
                      className="flex-1 border-gray-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-1">
                <p className="text-sm text-[#8A898C] mb-2 text-left">Try these styles:</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('simple')} className="border-[#9b87f5] text-[#403E43]">Simple</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('eli5')} className="border-[#9b87f5] text-[#403E43]">ELI5</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('clickbait')} className="border-[#9b87f5] text-[#403E43]">Clickbait</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('tamil')} className="border-[#9b87f5] text-[#403E43]">Tamil</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('executivesummary')} className="border-[#9b87f5] text-[#403E43]">Executive Summary</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('5')} className="border-[#9b87f5] text-[#403E43]">5 Bullets</Button>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-sm text-[#8A898C] pb-6">
            <p className="text-center mb-2">
              You can also directly access any URL with a custom style by adding it after llmcc.com/
            </p>
            <p className="text-center italic">
              Example: llmcc.com/executivesummary/example.com/article
            </p>
          </CardFooter>
        </Card>
      </section>

      {/* Features section */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-full bg-[#F6F6F7]">
            <Workflow className="h-6 w-6 text-[#9b87f5]" />
          </div>
          <div>
            <h3 className="font-bold text-[#221F26] text-lg mb-2">Tailored workflows</h3>
            <p className="text-[#8A898C]">
              Extract content with different styles and formats to suit your needs.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-full bg-[#F6F6F7]">
            <MilestoneIcon className="h-6 w-6 text-[#9b87f5]" />
          </div>
          <div>
            <h3 className="font-bold text-[#221F26] text-lg mb-2">Milestones</h3>
            <p className="text-[#8A898C]">
              Break down complex articles into digestible, concise summaries.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-full bg-[#F6F6F7]">
            <Users className="h-6 w-6 text-[#9b87f5]" />
          </div>
          <div>
            <h3 className="font-bold text-[#221F26] text-lg mb-2">Cross-team projects</h3>
            <p className="text-[#8A898C]">
              Share distilled content with your team using custom formatting options.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-full bg-[#F6F6F7]">
            <LineChart className="h-6 w-6 text-[#9b87f5]" />
          </div>
          <div>
            <h3 className="font-bold text-[#221F26] text-lg mb-2">Progress insights</h3>
            <p className="text-[#8A898C]">
              Track your reading progress and improve information retention with summaries.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center">
        <div className="flex space-x-4">
          <Button 
            onClick={() => document.querySelector('input')?.focus()} 
            className="bg-[#221F26] hover:bg-[#403E43]"
          >
            Get started
          </Button>
          <Button variant="outline" onClick={() => window.open('/docs/why edge.md', '_blank')} className="border-[#9b87f5] text-[#403E43]">
            Why Edge Functions →
          </Button>
        </div>
        <div className="mt-16 text-center">
          <span className="text-[#8A898C]">1 of 3 —</span>
          <span className="ml-2 font-medium text-[#221F26]">Distilled Content</span>
        </div>
      </section>
    </div>
  );
};

export default Index;
