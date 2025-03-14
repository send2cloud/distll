
import { SettingsData } from "@/components/SettingsModal";

export const getSettings = (): SettingsData => {
  const savedSettings = localStorage.getItem('distill-settings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings) as SettingsData;
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
  }
  return { openRouterApiKey: '' };
};
