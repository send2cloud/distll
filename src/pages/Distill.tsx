
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { getSummarizationStyleFromPath } from '@/utils/settings';
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
  const [isDirectAccess, setIsDirectAccess] = useState<boolean>(false);
  const [currentSummarizationStyle, setCurrentSummarizationStyle] = useState<SummarizationStyle>('standard');
  const [bulletCount, setBulletCount] = useState<number | undefined>(undefined);
  const [fullUrl, setFullUrl] = useState<string>('');
  
  useEffect(() => {
    console.log("Distill component mounted with path:", location.pathname);
    console.log("URL parameter:", url);
    console.log("Location pathname:", location.pathname);
    console.log("Bullet count parameter:", bulletCountParam);
    
    // Extract the full URL from the pathname
    let extractedUrl = '';
    
    if (location.pathname.startsWith('/eli5/')) {
      extractedUrl = location.pathname.substring(6); // Remove '/eli5/'
    } else if (location.pathname.startsWith('/simple/')) {
      extractedUrl = location.pathname.substring(8); // Remove '/simple/'
    } else if (location.pathname.startsWith('/esl/')) {
      extractedUrl = location.pathname.substring(5); // Remove '/esl/'
    } else if (location.pathname.startsWith('/tweet/')) {
      extractedUrl = location.pathname.substring(7); // Remove '/tweet/'
    } else {
      // Check for bullet point number
      const bulletMatch = location.pathname.match(/^\/(\d+)\/(.*)/);
      if (bulletMatch) {
        extractedUrl = bulletMatch[2]; // The URL after the bullet count
      } else if (url) {
        extractedUrl = url;
      }
    }
    
    console.log("Extracted URL:", extractedUrl);
    setFullUrl(extractedUrl);
    
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
  }, [location.pathname, bulletCountParam, url]);
  
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
