import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, Check } from 'lucide-react';
import buildStatus from 'virtual:build-status';

const LOVABLE_PROMPT =
  'Check why the build fail and if it\'s due to missing test add more tests, if it\'s due to missing translations, do the translations. But DO NOT lower the thresholds and DO NOT modify the legitimate English match rules at all.';

export function BuildStatusBanner() {
  const [copied, setCopied] = useState(false);

  // Show in dev mode or Lovable preview, never on published site
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevOrPreview = import.meta.env.DEV || hostname.includes('lovableproject.com') || hostname.includes('preview');
  if (!isDevOrPreview) return null;
  if (!isDevOrPreview) return null;

  // Only show when build status indicates a problem
  if (buildStatus.status === 'pass') return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(LOVABLE_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Alert variant="destructive" className="mb-6 border-destructive bg-destructive/10">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">
        {buildStatus.status === 'fail'
          ? '⚠️ Build Quality Check Failed'
          : '⚠️ Build Status Unknown'}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="font-medium">{buildStatus.message}</p>
        <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
          <p className="text-sm mb-2 font-medium">Copy this prompt and send it to Lovable:</p>
          <p className="text-sm italic text-muted-foreground">{LOVABLE_PROMPT}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleCopy}
          >
            {copied ? (
              <><Check className="h-3 w-3 mr-1" /> Copied!</>
            ) : (
              <><Copy className="h-3 w-3 mr-1" /> Copy prompt</>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
