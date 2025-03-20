
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from '@/contexts/SettingsContext';
import { AIModel } from '@/contexts/SettingsContext';

const modelOptions: { value: AIModel; label: string }[] = [
  { value: 'google/gemini-2.0-flash-thinking-exp:free', label: 'Google Gemini' },
  { value: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral AI' },
];

export const ModelSelector = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">Summarization Model</Label>
      <Select 
        value={settings.model} 
        onValueChange={(value) => updateSettings({ model: value as AIModel })}
      >
        <SelectTrigger id="model-select" className="w-full">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {modelOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        Different models provide different summarization capabilities.
      </p>
    </div>
  );
};
