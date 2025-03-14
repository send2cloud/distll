
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type SummarizationStyle = 
  | "standard" 
  | "simple" 
  | "bullets" 
  | "eli5" 
  | "concise"
  | "tweet";

export type SettingsData = {
  openRouterApiKey: string;
  useDirectUrlSummarization: boolean;
  summarizationStyle: SummarizationStyle;
  useRichResults: boolean;
  useJinaProxy: boolean;
  bulletCount?: number;
};

const SettingsModal = () => {
  const [open, setOpen] = useState(false);
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [useDirectUrlSummarization, setUseDirectUrlSummarization] = useState(false);
  const [summarizationStyle, setSummarizationStyle] = useState<SummarizationStyle>("standard");
  const [useRichResults, setUseRichResults] = useState(false);
  const [useJinaProxy, setUseJinaProxy] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('distill-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as SettingsData;
        setOpenRouterApiKey(parsed.openRouterApiKey || '');
        setUseDirectUrlSummarization(parsed.useDirectUrlSummarization || false);
        setSummarizationStyle(parsed.summarizationStyle || "standard");
        setUseRichResults(parsed.useRichResults || false);
        setUseJinaProxy(parsed.useJinaProxy || false);
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
      }
    }
  }, []);

  const saveSettings = () => {
    const settings: SettingsData = {
      openRouterApiKey,
      useDirectUrlSummarization,
      summarizationStyle,
      useRichResults,
      useJinaProxy,
      bulletCount: summarizationStyle === "bullets" ? 5 : undefined
    };
    
    localStorage.setItem('distill-settings', JSON.stringify(settings));
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
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="direct-url">Use Direct URL Summarization</Label>
              <p className="text-xs text-muted-foreground">
                Send URLs directly to OpenRouter for summary without fetching content first
              </p>
            </div>
            <Switch
              id="direct-url"
              checked={useDirectUrlSummarization}
              onCheckedChange={setUseDirectUrlSummarization}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rich-results">Use Rich Results</Label>
              <p className="text-xs text-muted-foreground">
                Show results with rich formatting and UI elements
              </p>
            </div>
            <Switch
              id="rich-results"
              checked={useRichResults}
              onCheckedChange={setUseRichResults}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="jina-proxy">Use JINA Proxy</Label>
              <p className="text-xs text-muted-foreground">
                Alternative content fetching method
              </p>
            </div>
            <Switch
              id="jina-proxy"
              checked={useJinaProxy}
              onCheckedChange={setUseJinaProxy}
            />
          </div>

          <div className="space-y-2">
            <Label>Summarization Style</Label>
            <RadioGroup 
              value={summarizationStyle} 
              onValueChange={(value) => setSummarizationStyle(value as SummarizationStyle)}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="cursor-pointer">Standard Summary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="simple" />
                <Label htmlFor="simple" className="cursor-pointer">Simple English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bullets" id="bullets" />
                <Label htmlFor="bullets" className="cursor-pointer">5 Bullet Points</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="eli5" id="eli5" />
                <Label htmlFor="eli5" className="cursor-pointer">Explain Like I'm 5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="concise" id="concise" />
                <Label htmlFor="concise" className="cursor-pointer">Concise Version</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tweet" id="tweet" />
                <Label htmlFor="tweet" className="cursor-pointer">Twitter-sized (140 chars)</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-2">
              Quick access: domain.com/eli5/example.com, domain.com/simple/example.com, 
              domain.com/5/example.com, domain.com/tweet/example.com
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
