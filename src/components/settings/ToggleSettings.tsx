
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/contexts/SettingsContext';

interface ToggleSectionProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const ToggleSection: React.FC<ToggleSectionProps> = ({ 
  id, title, description, checked, onCheckedChange 
}) => (
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <Label htmlFor={id}>{title}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
  </div>
);

export const ToggleSettings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <ToggleSection 
        id="direct-url"
        title="Use Direct URL Summarization"
        description="Send URLs directly to OpenRouter for summary without fetching content first"
        checked={settings.useDirectUrlSummarization}
        onCheckedChange={(checked) => updateSettings({ useDirectUrlSummarization: checked })}
      />

      <ToggleSection 
        id="rich-results"
        title="Use Rich Results"
        description="Show results with rich formatting and UI elements"
        checked={settings.useRichResults}
        onCheckedChange={(checked) => updateSettings({ useRichResults: checked })}
      />

      <ToggleSection 
        id="jina-proxy"
        title="Use JINA Proxy"
        description="Alternative content fetching method"
        checked={settings.useJinaProxy}
        onCheckedChange={(checked) => updateSettings({ useJinaProxy: checked })}
      />
    </>
  );
};
