import React from 'react';
import { cn } from "@/lib/utils";

const STYLES = [
  { id: 'tldr', label: 'TLDR' },
  { id: 'eli5', label: 'ELI5' },
  { id: 'larrydavid', label: 'Larry David' },
  { id: 'noir', label: 'Film Noir' },
  { id: 'conspiracy', label: 'Conspiracy Theorist' },
  { id: 'gordonramsay', label: 'Gordon Ramsay' },
  { id: 'haiku', label: 'Haiku' },
  { id: 'therapist', label: 'Therapist' },
  { id: 'pirate', label: 'Pirate' },
  { id: 'shakespeare', label: 'Shakespeare' },
  { id: 'genz', label: 'Gen Z' },
  { id: 'naturenarrator', label: 'David Attenborough' },
  { id: 'courtcase', label: 'Court Case' },
  { id: 'standup', label: 'Stand-Up Set' },
  { id: 'breakingnews', label: 'Breaking News' },
  { id: 'grandma', label: 'Your Grandma' },
  { id: 'asmr', label: 'ASMR Whisper' },
  { id: 'wikihow', label: 'wikiHow' },
  { id: 'villain', label: 'Bond Villain' },
  { id: 'sportscaster', label: 'Sportscaster' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface StyleGridProps {
  selectedStyle: string;
  onStyleClick: (id: string) => void;
}

export const StyleGrid = ({ selectedStyle, onStyleClick }: StyleGridProps) => {
  const [shuffled] = React.useState(() => shuffle(STYLES));

  return (
    <div className="flex flex-wrap gap-2">
      {shuffled.map(style => (
        <button
          key={style.id}
          type="button"
          onClick={() => onStyleClick(style.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm border transition-colors",
            selectedStyle === style.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
};
