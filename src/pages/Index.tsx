
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import SettingsModal from "@/components/SettingsModal";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center relative">
          <div className="absolute right-6 top-6">
            <SettingsModal />
          </div>
          <CardTitle className="text-4xl font-bold mb-2">Distill</CardTitle>
          <CardDescription className="text-xl">
            Extract and summarize content from any web page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Enter a URL to extract and summarize its content:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter URL (e.g., example.com/article)"
                  value={url}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button type="submit" disabled={!isValidUrl}>
                  Distill
                </Button>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-2">
                  Optional: Apply a custom style or perspective
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Custom style (e.g., clickbait, academic, etc.)"
                    value={customStyle}
                    onChange={handleStyleChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <p className="text-sm text-gray-600 mb-2">Try these styles:</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('simple')}>Simple</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('eli5')}>ELI5</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('clickbait')}>Clickbait</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('tamil')}>Tamil</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('executivesummary')}>Executive Summary</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('5')}>5 Bullets</Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-gray-500">
          <p className="text-center mb-2">
            You can also directly access any URL with a custom style by adding it after llmcc.com/
          </p>
          <p className="text-center italic">
            Example: llmcc.com/executivesummary/example.com/article
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
