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
import { ModelSelector } from "./settings/ModelSelector";

// Re-export types from the types file
export type { AIModel } from "@/types/settings";
export type { SettingsData } from "@/contexts/SettingsContext";

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
            Configure your model preferences for content distillation. Backend secrets are handled securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ModelSelector />
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
