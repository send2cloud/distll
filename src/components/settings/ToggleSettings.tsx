
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const ToggleSettings = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="dark-mode" />
        <Label htmlFor="dark-mode">Dark Mode</Label>
      </div>
    </div>
  );
};
