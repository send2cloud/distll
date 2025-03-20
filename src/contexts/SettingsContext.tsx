
import React, { createContext, useContext, useEffect, useState } from 'react';

export type SummarizationStyle = 
  | "standard" 
  | "simple" 
  | "bullets" 
  | "eli5" 
  | "concise"
  | "tweet";

export type AIModel = 
  | "google/gemini-2.0-flash-thinking-exp:free"
  | "mistralai/mistral-small-3.1-24b-instruct:free";

export type SettingsData = {
  openRouterApiKey: string;
  summarizationStyle: SummarizationStyle;
  model: AIModel;
  bulletCount?: number;
};

const DEFAULT_SETTINGS: SettingsData = {
  openRouterApiKey: '',
  summarizationStyle: 'standard',
  model: 'google/gemini-2.0-flash-thinking-exp:free',
};

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('distill-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as SettingsData;
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  const saveSettings = () => {
    const settingsToSave: SettingsData = {
      ...settings,
      bulletCount: settings.summarizationStyle === "bullets" ? 5 : undefined
    };
    
    localStorage.setItem('distill-settings', JSON.stringify(settingsToSave));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
