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

  useEffect(() => {
    const path = location.pathname;
    if (path.length > 1) {
      const targetUrl = path.substring(1);
      processUrl(targetUrl);
    }
  }, [location.pathname]);

  const validateUrl = (input: string) => {
    try {
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

    let processableUrl = url;
    if (processableUrl.startsWith('http://')) {
      processableUrl = processableUrl.substring(7);
    } else if (processableUrl.startsWith('https://')) {
      processableUrl = processableUrl.substring(8);
    }

    if (customStyle.trim()) {
      navigate(`/${customStyle.trim()}/${processableUrl}`);
    } else {
      navigate(`/${processableUrl}`);
    }
  };

  const processUrl = (targetUrl: string) => {
    navigate(`/${encodeURIComponent(targetUrl)}`);
  };

  const handleStyleClick = (style: string) => {
    if (isValidUrl) {
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
        description: `"${style}" style will be applied when you enter a valid URL`
      });
    }
  };

  return <div className="min-h-screen font-sans bg-[#e4d5c2]">
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#221F26] font-serif">Distill</div>
        <div className="flex items-center space-x-2">
          <SettingsModal />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-[#5d4a1d] font-serif">Distill the web</h1>
        <p className="text-2xl mb-8 max-w-3xl mx-auto text-[#a78a4e] font-sans">simple url based distiller</p>
        
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white">
          <CardContent className="pt-6 bg-[#e9e9e5]/[0.66] rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input type="text" placeholder="Enter URL (e.g., example.com/article)" value={url} onChange={handleInputChange} className="flex-1 border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5] font-sans" />
                  <Button type="submit" disabled={!isValidUrl} className="bg-[#221F26] hover:bg-[#403E43] font-sans">
                    Distill
                  </Button>
                </div>
                <div className="pt-4 py-0 px-[150px]">
                  <p className="text-sm mb-2 text-left text-orange-900 font-sans">
                    Optional: Apply a custom style or perspective
                  </p>
                  <div className="flex gap-2">
                    <Input type="text" placeholder="Custom style (e.g., clickbait, academic, etc.)" value={customStyle} onChange={handleStyleChange} className="flex-1 border-gray-300 font-sans" />
                  </div>
                </div>
              </div>
              
              <div className="pt-1">
                <p className="text-sm text-[#8A898C] mb-2 text-left font-sans">Try these styles:</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('simple')} className="border-[#9b87f5] text-[#403E43] rounded-full font-sans">Simple</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('eli5')} className="border-[#9b87f5] text-[#403E43] rounded-full font-sans">ELI5</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('clickbait')} className="border-[#9b87f5] text-[#403E43] rounded-full font-sans">Clickbait</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('tamil')} className="border-[#9b87f5] text-[#403E43] rounded-full font-sans">Tamil</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('executivesummary')} className="border-[#9b87f5] text-[#403E43] rounded-full font-sans">Executive Summary</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleStyleClick('5')} className="border-[#9b87f5] text-[#403E43] rounded-full font-sans">5 Bullets</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>;
};

export default Index;
