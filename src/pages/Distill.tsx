
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
  
  useEffect(() => {
    console.log("Distill component mounted with path:", location.pathname);
    console.log("URL parameter:", url);
    console.log("Bullet count parameter:", bulletCountParam);
    
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
  } = useContentProcessor(url, currentSummarizationStyle, bulletCount);
  
  useEffect(() => {
    console.log("Content processor parameters:", {
      url,
      style: currentSummarizationStyle,
      bulletCount
    });
  }, [url, currentSummarizationStyle, bulletCount]);
  
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
          url={url || ''}
        />
      )}
    </div>
  );
};

export default Distill;
