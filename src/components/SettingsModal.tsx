
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { ApiKeySettings } from "./settings/ApiKeySettings";
import { ToggleSettings } from "./settings/ToggleSettings";
import { SummarizationStyleSettings } from "./settings/SummarizationStyleSettings";

// Re-export types from context
export type { SummarizationStyle, SettingsData } from "@/contexts/SettingsContext";

const SettingsModalContent = () => {
  const [open, setOpen] = useState(false);
  const { saveSettings } = useSettings();

  const handleSaveSettings = () => {
    saveSettings();
    toast({
      title: "Settings saved",
      description: "Your settings have been saved to local storage"
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Distill Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and preferences for content distillation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ApiKeySettings />
          <ToggleSettings />
          <SummarizationStyleSettings />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Wrap the modal with the settings provider
const SettingsModal = () => {
  return (
    <SettingsProvider>
      <SettingsModalContent />
    </SettingsProvider>
  );
};

export default SettingsModal;
