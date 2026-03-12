import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import buildStatus from 'virtual:build-status';

interface BuildStatus {
  status: 'pass' | 'fail' | 'unknown';
  message?: string;
}

function buildPrompt(errorMessage: string): string {
  return `The build quality check failed with this error: "${errorMessage}".
Fix this by following these rules:
1. If tests are failing, fix the failing tests or add missing ones.
2. If translations are missing, add them to ALL 24 locale files.
3. If coverage is below threshold, add more tests to increase coverage.
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts.
DO NOT modify the English locale audit match rules.
DO NOT skip or delete existing tests.`;
}

export function BuildStatusBanner() {
  const [copied, setCopied] = useState(false);
  const [resolved, setResolved] = useState<BuildStatus>(buildStatus as BuildStatus);
  const { toast } = useToast();

  // If virtual module returned "unknown", try fetching the static artifact
  useEffect(() => {
    if (resolved.status !== 'unknown') return;

    fetch('/build-status.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BuildStatus | null) => {
        if (data && (data.status === 'pass' || data.status === 'fail')) {
          setResolved(data);
        }
      })
      .catch(() => {
        // File doesn't exist (dev mode) — keep unknown, banner stays hidden
      });
  }, [resolved.status]);

  // Only show banner on explicit failure
  if (resolved.status !== 'fail') return null;

  const prompt = buildPrompt(resolved.message ?? 'Unknown error');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({ title: 'Prompt copied!', description: 'Paste it into the Lovable chat.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Alert variant="destructive" className="mb-6 border-destructive bg-destructive/10">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold">⚠️ Build Quality Check Failed</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="font-medium">{resolved.message}</p>
        <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
          <p className="text-sm mb-2 font-medium">Copy this prompt and send it to Lovable:</p>
          <pre className="text-sm whitespace-pre-wrap text-muted-foreground select-all font-mono bg-muted/50 rounded p-2">{prompt}</pre>
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
