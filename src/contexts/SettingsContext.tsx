
import * as React from 'react';
import { AIModel } from '@/types/settings';

export type SettingsData = {
  openRouterApiKey: string;
  model: AIModel;
  darkMode: boolean;
};

const DEFAULT_SETTINGS: SettingsData = {
  openRouterApiKey: '',
  model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
  darkMode: false,
};

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = React.useState<SettingsData>(DEFAULT_SETTINGS);
  
  // Load settings from localStorage on initial render
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('distill-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as SettingsData;
        setSettings({
          ...DEFAULT_SETTINGS, // Ensure we have defaults for any new settings
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
    const settingsToSave = JSON.stringify(settings);
    localStorage.setItem('distill-settings', settingsToSave);
    console.log('Settings saved to localStorage:', settings);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('distill-settings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
