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
  return (
    <div className="space-y-4">
      {/* Keep this empty for now, will add any new toggles we might need in future */}
    </div>
  );
};
