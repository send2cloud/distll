
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

export const ApiKeySettings = () => {
  const { settings, updateSettings } = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey || '');

  const handleSaveApiKey = () => {
    updateSettings({ openRouterApiKey: apiKey });
    
    // Store the API key in localStorage for persistence across sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem('openRouterApiKey', apiKey);
    }
    
    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been saved successfully."
    });
  };

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="openrouter-api-key" className="text-sm font-medium">
          OpenRouter API Key
        </label>
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Input
              id="openrouter-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="w-full pr-10"
              type={showKey ? "text" : "password"}
            />
            <button 
              type="button"
              onClick={toggleShowKey}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button onClick={handleSaveApiKey} size="sm">
            Save
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline">OpenRouter</a>
      </p>
      
      <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
        <p className="font-medium">Why provide an API key?</p>
        <p className="mt-1">The OpenRouter API has rate limits on the free tier. Providing your own API key ensures uninterrupted service and higher rate limits.</p>
      </div>
    </div>
  );
};
