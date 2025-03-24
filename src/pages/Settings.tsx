
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { ApiKeySettings } from "@/components/settings/ApiKeySettings";
import { ModelSelector } from "@/components/settings/ModelSelector";
import { ToggleSettings } from "@/components/settings/ToggleSettings";
import { toast } from "@/components/ui/use-toast";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";

const SettingsContent = () => {
  const navigate = useNavigate();
  const { saveSettings } = useSettings();

  const handleSaveSettings = () => {
    saveSettings();
    toast({
      title: "Settings saved",
      description: "Your settings have been saved to local storage"
    });
  };

  return (
    <div className="min-h-screen bg-[#e4d5c2] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-[#221F26]">Settings</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure your API keys for content distillation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiKeySettings />
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Model</CardTitle>
            <CardDescription>Choose which AI model to use for summaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <ModelSelector />
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks and behaves.</CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleSettings />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="bg-[#221F26] hover:bg-[#403E43]"
          >
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

// Wrap the settings page with the SettingsProvider
const Settings = () => {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
};

export default Settings;
