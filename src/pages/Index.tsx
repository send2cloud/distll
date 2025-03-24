import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [customStyle, setCustomStyle] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

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
      <header className="px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="text-xl sm:text-2xl font-bold text-[#221F26] font-serif"> </div>
        <div className="flex items-center">
          <Button 
            variant="link" 
            onClick={() => navigate('/settings')} 
            className="text-[#221F26] hover:text-[#403E43]"
          >
            Settings
          </Button>
        </div>
      </header>

      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-16 pb-8 sm:pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 text-[#5d4a1d] font-serif">Rewrite the web</h1>
        <p className="text-lg sm:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-[#a78a4e] font-sans">just add rewrite.page in front of any article</p>
        
        <Card className="w-full max-w-xl mx-auto shadow-lg border-0 bg-white">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6 bg-[#e9e9e5]/[0.66] rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-2'}`}>
                  <Input type="text" placeholder="Enter URL (e.g., example.com/article)" value={url} onChange={handleInputChange} className="flex-1 border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5] font-sans text-base h-12 sm:h-10" />
                  <Button type="submit" disabled={!isValidUrl} className={`bg-[#221F26] hover:bg-[#403E43] font-sans ${isMobile ? 'w-full h-12' : 'h-10'} flex items-center justify-center`}>
                    Distill
                    {isMobile && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </div>
                
                <div className="pt-1 sm:pt-4 px-1 py-0 my-0 sm:px-[104px]">
                  <p className="text-sm mb-2 text-left text-orange-900 font-sans">optional modifier</p>
                  <Input type="text" placeholder="Custom style (e.g., clickbait, academic, etc.)" value={customStyle} onChange={handleStyleChange} className="w-full border-gray-300 font-sans h-12 sm:h-10 text-base" />
                </div>
              </div>
              
              <div className="pt-1">
                <p className="text-sm text-[#8A898C] mb-2 text-left font-sans">Try these modifiers:</p>
                <div className="flex flex-wrap gap-2">
                  {['simple', 'eli5', 'clickbait', 'tamil', 'executivesummary', '5'].map(style => <Button key={style} type="button" variant="outline" size={isMobile ? "default" : "sm"} onClick={() => handleStyleClick(style)} className="border-[coffee] text-[coffee] rounded-full font-sans min-h-[20px] py-0 px-[11px] mx-0 font-thin text-xs bg-[#ecd9ba]/[0.13]">
                      {style === '5' ? '5 Bullets' : style}
                    </Button>)}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>;
};

export default Index;
