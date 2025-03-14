import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { getSettings, getSummarizationStyleFromPath } from '@/utils/settings';
import { SummarizationStyle } from '@/components/SettingsModal';
import MinimalContentView from '@/components/MinimalContentView';
import DistillHeader from '@/components/distill/DistillHeader';
import LoadingIndicator from '@/components/distill/LoadingIndicator';
import ErrorDisplay from '@/components/distill/ErrorDisplay';
import ContentTabs from '@/components/distill/ContentTabs';
import { useContentProcessor } from '@/hooks/useContentProcessor';

const Distill = () => {
  const { url, bulletCount: bulletCountParam } = useParams<{ url: string, bulletCount?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDirectAccess, setIsDirectAccess] = useState<boolean>(true);
  const [currentSummarizationStyle, setCurrentSummarizationStyle] = useState<SummarizationStyle>('standard');
  const [bulletCount, setBulletCount] = useState<number | undefined>(undefined);
  const [fullUrl, setFullUrl] = useState<string>('');
  const [showRichUI, setShowRichUI] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("Distill component mounted with path:", location.pathname);
    
    // Load settings first
    const settings = getSettings();
    setShowRichUI(settings.useRichResults);
    
    // Direct access detection logic
    const referrer = document.referrer;
    const isFromLandingPage = referrer && (
      referrer.includes(window.location.host) || 
      referrer.includes('localhost')
    );
    
    // If we came from our own landing page, it's not a direct access
    setIsDirectAccess(!isFromLandingPage);
    console.log("Direct access:", !isFromLandingPage, "Referrer:", referrer);
    
    // First, determine the style and bullet count
    if (location.pathname) {
      const { style, bulletCount } = getSummarizationStyleFromPath(location.pathname);
      console.log("Path style detection:", style, "Bullet count:", bulletCount);
      setCurrentSummarizationStyle(style);
      setBulletCount(bulletCount);
      
      // If URL has a direct bullet count parameter
      if (bulletCountParam && !isNaN(parseInt(bulletCountParam, 10))) {
        const count = parseInt(bulletCountParam, 10);
        console.log("Setting bullet count from URL parameter:", count);
        setBulletCount(count);
        setCurrentSummarizationStyle('bullets');
      }
    }
    
    // Extract the full URL from the pathname
    let extractedUrl = '';
    
    if (location.pathname.startsWith('/eli5/')) {
      extractedUrl = location.pathname.substring(6); // Remove '/eli5/'
      console.log("Extracted URL from eli5 path:", extractedUrl);
    } else if (location.pathname.startsWith('/simple/')) {
      extractedUrl = location.pathname.substring(8); // Remove '/simple/'
      console.log("Extracted URL from simple path:", extractedUrl);
    } else if (location.pathname.startsWith('/esl/')) {
      extractedUrl = location.pathname.substring(5); // Remove '/esl/'
      console.log("Extracted URL from esl path:", extractedUrl);
    } else if (location.pathname.startsWith('/tweet/')) {
      extractedUrl = location.pathname.substring(7); // Remove '/tweet/'
      console.log("Extracted URL from tweet path:", extractedUrl);
    } else {
      // Check for bullet point number
      const bulletMatch = location.pathname.match(/^\/(\d+)\/(.*)/);
      if (bulletMatch) {
        extractedUrl = bulletMatch[2]; // The URL after the bullet count
        console.log("Extracted URL from bullet count path:", extractedUrl);
      } else if (location.pathname !== '/' && location.pathname.length > 1) {
        // This is the direct URL case - the URL is the entire pathname except the leading slash
        extractedUrl = location.pathname.substring(1);
        console.log("Direct URL case, extracted:", extractedUrl);
      } else if (url) {
        // Fallback to the URL parameter if provided
        extractedUrl = url;
        console.log("Using direct URL parameter:", extractedUrl);
      }
    }
    
    console.log("Final extracted URL:", extractedUrl);
    setFullUrl(extractedUrl);
    
  }, [location.pathname, bulletCountParam, url]);
  
  // If we're in direct access mode or settings say plain text mode, set Content-Type header
  useEffect(() => {
    if (isDirectAccess) {
      // Set the Content-Type for text/plain output
      document.title = "Distill Summary";
      // Can't actually set Content-Type from client side JavaScript, 
      // but we'll style the output to look like plain text
    }
  }, [isDirectAccess]);
  
  const { 
    originalContent, 
    summary, 
    isLoading, 
    error, 
    progress 
  } = useContentProcessor(fullUrl || url, currentSummarizationStyle, bulletCount);
  
  useEffect(() => {
    console.log("Content processor parameters:", {
      url: fullUrl || url,
      style: currentSummarizationStyle,
      bulletCount
    });
  }, [fullUrl, url, currentSummarizationStyle, bulletCount]);
  
  const handleBack = () => {
    navigate('/');
  };

  // For direct URL access or if rich UI is disabled in settings, use minimal view
  if (isDirectAccess || !showRichUI) {
    return <MinimalContentView 
      content={summary} 
      isLoading={isLoading} 
      error={error} 
      style={currentSummarizationStyle}
    />;
  }

  // Otherwise, use the rich UI view
  return (
    <div className="container mx-auto px-4 py-8">
      <DistillHeader onBack={handleBack} />
      
      {isLoading && <LoadingIndicator progress={progress} />}
      
      {error && <ErrorDisplay error={error} />}
      
      {!isLoading && !error && (
        <ContentTabs 
          summary={summary} 
          originalContent={originalContent} 
          url={fullUrl || url || ''}
        />
      )}
    </div>
  );
};

export default Distill;
