import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SummarizationStyle } from '@/types/settings';
import PlainTextDisplay from '@/components/common/PlainTextDisplay';
import ContentStateDisplay from '@/components/common/ContentStateDisplay';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MinimalContentViewProps {
  content: string;
  isLoading: boolean;
  error: Error & { errorCode?: string } | null;
  style: string;
}

const MinimalContentView = ({ content, isLoading, error, style = 'standard' }: MinimalContentViewProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const hasRawInput = Boolean(content) && typeof content === 'string';
  const hasRawContent = hasRawInput && content.trim().length > 0;
  const processedContent = hasRawContent ? content : '';
  const hasActualContent = Boolean(processedContent && processedContent.trim().length > 0);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `rewrite.page — ${style}`, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {style}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Share"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {(isLoading || error || !hasActualContent) ? (
        <div className="max-w-2xl mx-auto p-4 mt-8">
          <ContentStateDisplay
            isLoading={isLoading}
            error={error}
            hasContent={hasActualContent}
            emptyMessage={`No content available${hasRawContent ? ' (empty after processing)' : ''}. Check the URL or try a different page.`}
            errorMessage={error ? `Error: ${error.message}` : undefined}
          />
        </div>
      ) : (
        <div className="p-4 max-w-2xl mx-auto">
          <PlainTextDisplay content={processedContent} asPlainText={true} />
        </div>
      )}
    </div>
  );
};

export default MinimalContentView;
