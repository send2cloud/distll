
import { SettingsData, SummarizationStyle } from "@/components/SettingsModal";

export const getSettings = (): SettingsData => {
  const savedSettings = localStorage.getItem('distill-settings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings) as SettingsData;
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
  }
  return { 
    openRouterApiKey: '',
    useDirectUrlSummarization: false,
    summarizationStyle: 'standard' as SummarizationStyle
  };
};

export const getSummarizationStyleFromPath = (pathname: string): {style: SummarizationStyle, bulletCount?: number} => {
  if (pathname.startsWith('/eli5/')) {
    return { style: 'eli5' };
  } else if (pathname.startsWith('/simple/') || pathname.startsWith('/esl/')) {
    return { style: 'simple' };
  } else if (pathname.startsWith('/tweet/')) {
    return { style: 'tweet' };
  } else {
    // Check for bullet point number in URL path
    const bulletMatch = pathname.match(/^\/(\d+)\//);
    if (bulletMatch) {
      const bulletCount = parseInt(bulletMatch[1], 10);
      return { style: 'bullets', bulletCount };
    }
  }
  
  return { style: 'standard' };
};
