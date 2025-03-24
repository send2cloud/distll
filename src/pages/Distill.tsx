
import * as React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getSummarizationStyleFromPath } from '@/utils/settings';
import MinimalContentView from '@/components/MinimalContentView';
import { useContentProcessor } from '@/hooks/useContentProcessor';

const Distill = () => {
  const { customStyle } = useParams<{ customStyle?: string }>();
  const location = useLocation();
  // Use string type to support custom styles
  const [currentSummarizationStyle, setCurrentSummarizationStyle] = React.useState<string>('standard');
  const [bulletCount, setBulletCount] = React.useState<number | undefined>(undefined);
  const [fullUrl, setFullUrl] = React.useState<string>('');
  
  React.useEffect(() => {
    console.log("Current path:", location.pathname);
    console.log("Custom style param:", customStyle);
    
    // First, determine the style and bullet count
    if (location.pathname) {
      const { style, bulletCount } = getSummarizationStyleFromPath(location.pathname);
      console.log("Extracted style and bulletCount:", style, bulletCount);
      
      // Set the style as a string without casting
      setCurrentSummarizationStyle(style);
      setBulletCount(bulletCount);
      
      // If URL has a direct bullet count parameter
      if (customStyle && !isNaN(parseInt(customStyle, 10))) {
        const count = parseInt(customStyle, 10);
        setBulletCount(count);
        setCurrentSummarizationStyle('bullets');
      }
    }
    
    // Extract the full URL from the pathname (everything after the style prefix)
    let extractedUrl = '';
    
    if (customStyle) {
      // This is a style-based URL
      const pathParts = location.pathname.split(`/${customStyle}/`);
      if (pathParts.length > 1) {
        extractedUrl = pathParts[1];
      }
    } else if (location.pathname !== '/' && location.pathname.length > 1) {
      // This is the direct URL case - the URL is the entire pathname except the leading slash
      extractedUrl = location.pathname.substring(1);
    }
    
    if (extractedUrl) {
      try {
        // First try standard decoding
        let decodedUrl = decodeURIComponent(extractedUrl);
        
        // If not properly decoded, attempt a more conservative approach
        if (!decodedUrl.includes('http') && !decodedUrl.includes('://')) {
          decodedUrl = extractedUrl.replace(/^https?%3A%2F%2F/, 'https://').replace(/%2F/g, '/');
          
          // If still no protocol, try direct extraction from the path
          if (!decodedUrl.includes('http') && !decodedUrl.includes('://')) {
            decodedUrl = extractedUrl;
          }
        }
        
        setFullUrl(decodedUrl);
        console.log("Extracted and decoded URL:", decodedUrl);
      } catch (e) {
        console.error("Error decoding URL:", e);
        // Fallback to raw URL if decoding fails
        setFullUrl(extractedUrl);
      }
    }
  }, [location.pathname, customStyle]);
  
  // Set plain text title
  React.useEffect(() => {
    document.title = "Distill Summary";
  }, []);
  
  const { 
    summary, 
    isLoading, 
    error 
  } = useContentProcessor(fullUrl, currentSummarizationStyle, bulletCount);

  // Log what's being sent to the content processor
  React.useEffect(() => {
    console.log("Sending to content processor:", {
      url: fullUrl,
      style: currentSummarizationStyle,
      bulletCount: bulletCount
    });
  }, [fullUrl, currentSummarizationStyle, bulletCount]);

  // Always use the minimal view
  return (
    <MinimalContentView 
      content={summary} 
      isLoading={isLoading} 
      error={error} 
      style={currentSummarizationStyle}
    />
  );
};

export default Distill;
