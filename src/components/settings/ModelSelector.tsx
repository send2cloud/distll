
import React from 'react';
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from '@/contexts/SettingsContext';
import { AIModel } from '@/types/settings';

interface ModelOption {
  value: AIModel;
  label: string;
  description: string;
}

const models: ModelOption[] = [
  {
    value: 'google/gemma-3-4b-it',
    label: 'Gemma 3.4B (Google)',
    description: 'Reliable and efficient AI model for text summarization'
  },
  {
    value: 'google/gemini-2.5-pro-exp-03-25:free',
    label: 'Gemini 2.5 Pro (Google)',
    description: 'Latest and most capable AI model from Google'
  },
  {
    value: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    label: 'Gemini 2.0 Flash Lite (Google)',
    description: 'Fast and lightweight AI model from Google'
  },
  {
    value: 'google/gemini-2.0-flash-thinking-exp:free',
    label: 'Gemini 2.0 (Google)',
    description: 'Fast and efficient AI model from Google'
  },
  {
    value: 'mistralai/mistral-small-3.1-24b-instruct:free',
    label: 'Mistral 3.1 Small (Mistral AI)',
    description: '24B parameter efficient model from Mistral AI'
  }
];

export const ModelSelector = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1">
        <Label htmlFor="model-selector">AI Model</Label>
        <Select 
          value={settings.model} 
          onValueChange={(value) => updateSettings({ model: value as AIModel })}
        >
          <SelectTrigger id="model-selector">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {models.find(m => m.value === settings.model)?.description || "Select the AI model for generating summaries"}
        </p>
      </div>
    </div>
  );
};
