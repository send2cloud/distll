
import { SummarizationStyle } from "@/components/SettingsModal";

// Return fixed default settings without using localStorage
export const getSettings = () => {
  return { 
    summarizationStyle: 'standard' as SummarizationStyle
  };
};

export const getSummarizationStyleFromPath = (pathname: string): {style: SummarizationStyle, bulletCount?: number} => {
  console.log("Detecting style from path:", pathname);
  
  if (pathname.startsWith('/eli5/')) {
    console.log("Detected ELI5 style");
    return { style: 'eli5' };
  } else if (pathname.startsWith('/simple/')) {
    console.log("Detected Simple style");
    return { style: 'simple' };
  } else if (pathname.startsWith('/esl/')) {
    console.log("Detected ESL style");
    return { style: 'simple' };
  } else if (pathname.startsWith('/tweet/')) {
    console.log("Detected Tweet style");
    return { style: 'tweet' };
  } else {
    // Check for bullet point number in URL path
    const bulletMatch = pathname.match(/^\/(\d+)\//);
    if (bulletMatch) {
      const bulletCount = parseInt(bulletMatch[1], 10);
      console.log("Detected Bullets style with count:", bulletCount);
      return { style: 'bullets', bulletCount };
    }
  }
  
  console.log("Falling back to standard style for path:", pathname);
  return { style: 'standard' };
};
