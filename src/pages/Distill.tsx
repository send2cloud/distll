
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSummarizationStyleFromPath } from '@/utils/settings';
import { SummarizationStyle } from '@/components/SettingsModal';
import MinimalContentView from '@/components/MinimalContentView';
import { useContentProcessor } from '@/hooks/useContentProcessor';

const Distill = () => {
  const { url, bulletCount: bulletCountParam } = useParams<{ url: string, bulletCount?: string }>();
  const location = useLocation();
  const [currentSummarizationStyle, setCurrentSummarizationStyle] = useState<SummarizationStyle>('standard');
  const [bulletCount, setBulletCount] = useState<number | undefined>(undefined);
  const [fullUrl, setFullUrl] = useState<string>('');
  
  useEffect(() => {
    console.log("Distill component mounted with path:", location.pathname);
    
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
    
    console.log("Final extracted URL before decoding:", extractedUrl);
    
    // Special handling for URLs with .html or other extensions
    // URLs often get decoded incorrectly when they have special chars followed by extensions
    try {
      // First try standard decoding
      let decodedUrl = decodeURIComponent(extractedUrl);
      
      // Check if the URL was properly decoded by looking for "http" in the string
      if (!decodedUrl.includes('http') && !decodedUrl.includes('://')) {
        // If not properly decoded, attempt a more conservative approach
        // This is especially important for URLs with .html or other extensions
        decodedUrl = extractedUrl.replace(/^https?%3A%2F%2F/, 'https://').replace(/%2F/g, '/');
        
        // If still no protocol, try direct extraction from the path
        if (!decodedUrl.includes('http') && !decodedUrl.includes('://')) {
          decodedUrl = extractedUrl;
        }
      }
      
      console.log("URL after decoding:", decodedUrl);
      setFullUrl(decodedUrl);
    } catch (e) {
      console.error("Error decoding URL:", e);
      // Fallback to raw URL if decoding fails
      setFullUrl(extractedUrl);
    }
    
  }, [location.pathname, bulletCountParam, url]);
  
  // Set plain text title
  useEffect(() => {
    document.title = "Distill Summary";
  }, []);
  
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
