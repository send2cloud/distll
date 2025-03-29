
import React from 'react';
import { Input } from "@/components/ui/input";
import { useSettings } from '@/contexts/SettingsContext';

export const ApiKeySettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-2">
      <label htmlFor="openrouter-api-key" className="text-sm font-medium">
        OpenRouter API Key
      </label>
      <Input
        id="openrouter-api-key"
        value={settings.openRouterApiKey}
        onChange={(e) => updateSettings({ openRouterApiKey: e.target.value })}
        placeholder="Enter your OpenRouter API key"
        className="w-full"
        type="password"
      />
      <p className="text-xs text-muted-foreground">
        Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline">OpenRouter</a>
      </p>
    </div>
  );
};
