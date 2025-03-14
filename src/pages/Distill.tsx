
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
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
  
  const { 
    originalContent, 
    summary, 
    isLoading, 
    error, 
    progress 
  } = useContentProcessor(url, currentSummarizationStyle, bulletCount);
  
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
