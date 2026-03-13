/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { supabase } from '@/integrations/supabase/client';

interface BuildStatus {
  status: 'pass' | 'fail' | 'unknown';
  message?: string;
  failedTests?: string[];
  stderr?: string;
}

function buildPrompt(errorMessage: string): string {
  return `The build quality check failed with this error: "${errorMessage}".
Fix this by following these rules:
1. Fix the actual error causing the failure — do NOT just fix or delete the tests.
2. If translations are missing, add them to ALL 24 locale files.
3. If coverage is below threshold, add more tests to increase coverage.
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts — they should all be set to 30.
DO NOT modify the English locale audit match rules.
DO NOT skip or delete existing tests.`;
}

export function BuildStatusBanner() {
  const [resolved, setResolved] = useState<BuildStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();
  const { config, loading: configLoading } = useSiteConfig();

  const isPreview = import.meta.env.DEV || window.location.hostname.includes('id-preview--');

  useEffect(() => {
    if (!isPreview || configLoading) return;

    const baseUrl = config?.site_url?.replace(/\/+$/, '');
    if (!baseUrl) {
      setResolved({ status: 'unknown', message: 'No site URL configured — cannot check build status.' });
      return;
    }

    const fetchUrl = `${baseUrl}/build-status.json`;

    supabase.functions
      .invoke('get-build-status', { body: { url: fetchUrl } })
      .then(({ data, error }) => {
        if (error) {
          setResolved({ status: 'unknown', message: `Could not fetch build status: ${error.message}` });
          return;
        }
        const parsed = data as BuildStatus | null;
        if (parsed && (parsed.status === 'pass' || parsed.status === 'fail')) {
          setResolved(parsed);
        } else {
          setResolved({ status: 'unknown', message: 'Build status file returned unexpected data.' });
        }
      })
      .catch((err) => {
        setResolved({ status: 'unknown', message: `Could not fetch build status: ${err?.message ?? 'Network error'}` });
      });
  }, [isPreview, configLoading, config?.site_url]);

  useEffect(() => {
    if (resolved?.status === 'pass') {
      const timer = setTimeout(() => setDismissed(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [resolved?.status]);

  if (!isPreview || dismissed) return null;

  const isLoading = resolved === null;
  const prompt = buildPrompt(resolved?.message ?? 'Unknown error');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({ title: 'Prompt copied!', description: 'Paste it into the Lovable chat.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = resolved?.status === 'pass';
  const isGreen = isLoading || isSuccess;

  if (isSuccess) {
    return (
      <Alert className="mb-6 border-green-500 bg-green-500/10 text-green-700">
        <Check className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-lg font-bold mb-0">✅ All checks passed!</AlertTitle>
      </Alert>
    );
  }

  return (
    <Alert variant={isGreen ? undefined : "destructive"} className={cn("mb-6", isGreen ? "border-green-500 bg-green-500/10 text-green-700" : "border-destructive bg-destructive/10")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full cursor-pointer text-left">
          {isLoading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <AlertTitle className="text-lg font-bold flex-1 mb-0">
            {isLoading ? '⏳ Checking build status…' : '⚠️ Build Quality Check Failed'}
          </AlertTitle>
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AlertDescription className="mt-3 space-y-3 pl-7">
            <p className="font-medium">{resolved?.message ?? 'Fetching build status…'}</p>
            <p className="text-sm text-muted-foreground italic">
              This banner is only visible in preview mode — it will not appear on your published website.
            </p>
            {!isLoading && resolved?.failedTests && resolved.failedTests.length > 0 && (
              <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
                <p className="text-sm font-medium mb-2">Failed tests ({resolved.failedTests.length}):</p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {resolved.failedTests.map((test, i) => (
                    <p key={i} className="text-xs font-mono text-muted-foreground break-all">• {test}</p>
                  ))}
                </div>
              </div>
            )}
            {!isLoading && resolved?.stderr && (
              <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
                <p className="text-sm font-medium mb-2">Build output (last 3000 chars):</p>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground font-mono max-h-40 overflow-y-auto">{resolved.stderr}</pre>
              </div>
            )}
            {!isLoading && (
              <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
                <p className="text-sm mb-2 font-medium">Copy this prompt, send it to Lovable, then re-publish the website:</p>
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
            )}
          </AlertDescription>
        </CollapsibleContent>
      </Collapsible>
    </Alert>
  );
}