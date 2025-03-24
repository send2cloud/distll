
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/contexts/SettingsContext';

export const ToggleSettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="dark-mode" 
          checked={settings.darkMode}
          onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
        />
        <Label htmlFor="dark-mode">Dark Mode</Label>
      </div>
    </div>
  );
};
