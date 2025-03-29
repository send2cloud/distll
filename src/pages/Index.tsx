
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight, HelpCircle, ExternalLink } from "lucide-react";
import { StyleShowcase } from "@/components/StyleShowcase";
import { styleFacade } from '@/services/styles';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [customStyle, setCustomStyle] = useState('');
  const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const isMobile = useIsMobile();
  
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
    
    // Clean up the URL by removing protocol if present
    let processableUrl = url;
    if (processableUrl.startsWith('http://')) {
      processableUrl = processableUrl.substring(7);
    } else if (processableUrl.startsWith('https://')) {
      processableUrl = processableUrl.substring(8);
    }
    
    console.log("Processing URL:", processableUrl);
    
    // Normalize the style
    const normalizedStyle = customStyle.trim() ? 
      styleFacade.normalizeStyleId(customStyle.trim()) : '';
    
    // Construct the Edge function URL - always use Supabase Edge function
    let edgeFunctionUrl;
    const projectId = "mibqumffyhfbuddsyuaq"; // Supabase project ID
    
    // Always use Supabase edge function regardless of development or production
    edgeFunctionUrl = `https://${projectId}.supabase.co/functions/v1/rewrite`;
    
    // Add style path component if provided
    if (normalizedStyle) {
      edgeFunctionUrl += `/${normalizedStyle}`;
    }
    
    // Add the URL to process
    edgeFunctionUrl += `/${processableUrl}`;
    
    console.log("Redirecting to Edge function:", edgeFunctionUrl);
    
    // Redirect to the Edge function
    window.location.href = edgeFunctionUrl;
  };
  
  const handleStyleSelect = (styleId: string) => {
    setCustomStyle(styleId);
    
    const styleDef = styleFacade.getStyle(styleId);
    toast({
      title: `${styleDef.name} Style Selected`,
      description: styleDef.description,
    });
  };
  
  const toggleStyleSelector = () => {
    setIsStyleSelectorOpen(!isStyleSelectorOpen);
  };
  
  const toggleHowToUse = () => {
    setShowHowToUse(!showHowToUse);
  };
  
  const exampleStyles = [
    'simple', 'eli5', 'clickbait', 'seinfeld-standup', 'piratetalk',
    'haiku', 'top10', 'todo-list', 'fantasy', 'tldr', 'poetry',
    'shakespeare', 'movie-trailer', 'newsletter', 'telegram'
  ];
  
  return <div className="min-h-screen font-sans bg-[#e4d5c2]">
      <header className="px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="text-xl sm:text-2xl font-bold text-[#221F26] font-serif">Rewrite.page</div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleHowToUse} 
          className="text-[#5d4a1d] hover:text-[#403E43] flex items-center gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          How to Use
        </Button>
      </header>

      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-16 pb-8 sm:pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 text-[#5d4a1d] font-serif">Rewrite the web</h1>
        <p className="text-lg sm:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-[#a78a4e] font-sans">just add rewrite.page in front of any article</p>
        
        {showHowToUse && (
          <Card className="w-full max-w-2xl mx-auto mb-8 shadow-lg border-0 bg-white/80">
            <CardContent className="pt-6 px-6 pb-6 text-left">
              <h2 className="text-xl font-bold mb-3 text-[#5d4a1d]">How to Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-[#5d4a1d]">1. Enter a URL</h3>
                  <p className="text-sm text-[#8A898C]">Paste any article URL you want to rewrite</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-[#5d4a1d]">2. Add a Style (Optional)</h3>
                  <p className="text-sm text-[#8A898C]">Choose from suggested styles or create your own custom style like:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/eli5/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/seinfeld-standup/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/top10/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/todo-list/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/haiku/</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-[#5d4a1d]">3. Get Your Rewrite</h3>
                  <p className="text-sm text-[#8A898C]">Click "Rewrite" and we'll transform the content for you</p>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <h3 className="font-medium text-[#5d4a1d]">Direct URL Format</h3>
                  <code className="text-xs block bg-gray-100 p-2 rounded mt-1 text-[#221F26]">
                    https://mibqumffyhfbuddsyuaq.supabase.co/functions/v1/rewrite/<span className="text-blue-600">[style]</span>/<span className="text-green-600">example.com/article</span>
                  </code>
                  <p className="text-xs mt-1 text-[#8A898C]">
                    <span className="text-blue-600">Optional style</span> + 
                    <span className="text-green-600"> URL to rewrite</span>
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-[#5d4a1d]">Creative Style Examples</h3>
                  <p className="text-sm text-[#8A898C]">The AI can adapt to any style you request:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/poetry/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/shakespeare/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/movie-trailer/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/newsletter/</span>
                    <span className="text-xs bg-[#ecd9ba]/[0.5] px-2 py-1 rounded-full text-[#5d4a1d]">/telegram/</span>
                  </div>
                </div>
                
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs text-[#5d4a1d] border-[#a78a4e]/30"
                    onClick={() => window.open('/user-guide', '_blank')}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View Full Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="w-full max-w-xl mx-auto shadow-lg border-0 bg-white">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 sm:pb-6 bg-[#e9e9e5]/[0.66] rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-2'}`}>
                  <Input type="text" placeholder="Enter URL (e.g., example.com/article)" value={url} onChange={handleInputChange} className="flex-1 border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5] font-sans text-base h-12 sm:h-10" />
                  <Button type="submit" disabled={!isValidUrl} className={`bg-[#221F26] hover:bg-[#403E43] font-sans ${isMobile ? 'w-full h-12' : 'h-10'} flex items-center justify-center`}>
                    Rewrite
                    {isMobile && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </div>
                
                <div className="pt-1 sm:pt-4 px-1 py-0 my-0 sm:px-[104px]">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-left text-orange-900 font-sans">Optional Style</p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleStyleSelector}
                      className="text-xs text-orange-900 h-6 px-2"
                    >
                      {isStyleSelectorOpen ? 'Hide Styles' : 'Browse Styles'}
                    </Button>
                  </div>
                  <Input 
                    type="text" 
                    placeholder="Custom style (e.g., seinfeld-standup, top10, etc.)" 
                    value={customStyle} 
                    onChange={handleStyleChange} 
                    className="w-full border-gray-300 font-sans h-12 sm:h-10 text-base rounded-full" 
                  />
                </div>
              </div>
              
              {isStyleSelectorOpen && (
                <div className="pt-2">
                  <StyleShowcase onStyleSelect={handleStyleSelect} />
                </div>
              )}
              
              {!isStyleSelectorOpen && (
                <div className="pt-1">
                  <p className="text-sm text-[#8A898C] mb-2 text-left font-sans">Try these styles:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleStyles.map(style => (
                      <Button 
                        key={style} 
                        type="button" 
                        variant="outline" 
                        size={isMobile ? "default" : "sm"} 
                        onClick={() => handleStyleSelect(style)}
                        className="border-[coffee] text-[coffee] rounded-full font-sans min-h-[20px] py-0 px-[11px] mx-0 font-thin text-xs bg-[#ecd9ba]/[0.13]"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>
    </div>;
};

export default Index;
