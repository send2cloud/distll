
import React, { useEffect, useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export type SettingsData = {
  openRouterApiKey: string;
};

const SettingsModal = () => {
  const [open, setOpen] = useState(false);
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('distill-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as SettingsData;
        setOpenRouterApiKey(parsed.openRouterApiKey || '');
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
      }
    }
  }, []);

  const saveSettings = () => {
    const settings: SettingsData = {
      openRouterApiKey
    };
    
    localStorage.setItem('distill-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your API key has been saved to local storage"
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
          <div className="space-y-2">
            <label htmlFor="openrouter-api-key" className="text-sm font-medium">
              OpenRouter API Key
            </label>
            <Input
              id="openrouter-api-key"
              value={openRouterApiKey}
              onChange={(e) => setOpenRouterApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="w-full"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline">OpenRouter</a>
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
