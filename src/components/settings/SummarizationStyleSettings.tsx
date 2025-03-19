
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from '@/contexts/SettingsContext';
import { SummarizationStyle } from '@/contexts/SettingsContext';

const styleOptions: { value: SummarizationStyle; label: string }[] = [
  { value: 'standard', label: 'Standard Summary' },
  { value: 'simple', label: 'Simple English' },
  { value: 'bullets', label: '5 Bullet Points' },
  { value: 'eli5', label: 'Explain Like I\'m 5' },
  { value: 'concise', label: 'Concise Version' },
  { value: 'tweet', label: 'Twitter-sized (140 chars)' },
];

export const SummarizationStyleSettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-2">
      <Label>Summarization Style</Label>
      <RadioGroup 
        value={settings.summarizationStyle} 
        onValueChange={(value) => updateSettings({ summarizationStyle: value as SummarizationStyle })}
        className="grid grid-cols-1 gap-2"
      >
        {styleOptions.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground mt-2">
        Quick access: domain.com/eli5/example.com, domain.com/simple/example.com, 
        domain.com/5/example.com, domain.com/tweet/example.com
      </p>
    </div>
  );
};
