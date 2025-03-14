
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import SettingsModal from "@/components/SettingsModal";

interface DistillHeaderProps {
  onBack: () => void;
}

const DistillHeader = ({ onBack }: DistillHeaderProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Button variant="outline" onClick={onBack} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <SettingsModal />
    </div>
  );
};

export default DistillHeader;
