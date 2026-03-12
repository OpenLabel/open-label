import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Camera, Upload, Loader2, AlertTriangle, FileText, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { useSiteConfig } from '@/hooks/useSiteConfig';

interface WineAIAutofillProps {
  onAutofill: (data: Record<string, unknown>) => void;
  onAutofillMeta?: (meta: { dppName?: string; productImageBase64?: string }) => void;
}

export function WineAIAutofill({ onAutofill, onAutofillMeta }: WineAIAutofillProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { config } = useSiteConfig();

  // Don't render if AI is disabled
  if (!config?.ai_enabled) {
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process the image
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call the edge function (QR decoding now happens server-side)
      const { data, error } = await supabase.functions.invoke('wine-label-ocr', {
        body: { image: base64 }
      });

      if (error) {
        // Check if this is a quota exceeded error
        if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('Fair usage quota')) {
          setShowQuotaDialog(true);
          setIsOpen(false);
          setPreviewUrl(null);
          return;
        }
        throw new Error(error.message || 'Failed to process image');
      }

      // Check for quota exceeded in response data
      if (data?.code === 'QUOTA_EXCEEDED') {
        setShowQuotaDialog(true);
        setIsOpen(false);
        setPreviewUrl(null);
        return;
      }

      if (data?.extractedData) {
        const quotaInfo = data.quota ? ` (${data.quota.remaining} scans remaining this month)` : '';
        const qrInfo = data.qrCodeUsed ? ` ${t('ai.qrCodeUsed')}` : '';
        onAutofill(data.extractedData);
        // Pass meta (DPP name + product image) up to PassportForm
        if (onAutofillMeta) {
          const meta: { dppName?: string; productImageBase64?: string } = {};
          if (data.extractedData.product_name) {
            meta.dppName = data.extractedData.product_name as string;
          }
          if (data.productImageBase64) {
            meta.productImageBase64 = data.productImageBase64;
          }
          if (meta.dppName || meta.productImageBase64) {
            onAutofillMeta(meta);
          }
        }
        toast({
          title: t('ai.autofillComplete'),
          description: `${t('ai.autofillCompleteDesc')}${qrInfo}${quotaInfo}`,
        });
        setIsOpen(false);
        setPreviewUrl(null);
      } else {
        throw new Error(t('ai.noDataExtracted'));
      }
    } catch (error) {
      console.error('Error processing wine label:', error);
      
      // Check for quota error in catch block as well
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('Fair usage quota') || errorMessage.includes('429')) {
        setShowQuotaDialog(true);
        setIsOpen(false);
        setPreviewUrl(null);
        return;
      }
      
      toast({
        title: t('ai.processingFailed'),
        description: errorMessage || t('ai.processingFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Apple Intelligence-style gradient button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative w-full overflow-hidden rounded-xl p-[2px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 15%, #FEC89A 30%, #98D8AA 50%, #7EB6FF 70%, #A78BFA 85%, #F472B6 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 4s ease infinite',
        }}
      >
        <div className="relative flex items-center justify-center gap-3 rounded-[10px] bg-background/95 px-6 py-4 backdrop-blur-sm transition-all group-hover:bg-background/90">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            {t('ai.autofillButton')}
          </span>
          <span className="ml-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            {t('ai.experimental')}
          </span>
        </div>
      </button>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={(open) => { 
        setIsOpen(open); 
        if (!open) {
          setPreviewUrl(null);
          setIsProcessing(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {t('ai.scannerTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('ai.scannerDescription')}
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <strong>{t('ai.experimental')}:</strong> {t('ai.experimentalWarning')}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl || isProcessing ? (
              <div className="relative">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Wine label preview" 
                    className="w-full rounded-lg object-cover max-h-64"
                  />
                )}
                {!previewUrl && isProcessing && (
                  <div className="h-48 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <span className="text-sm font-medium">{t('ai.analyzing')}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={triggerFileInput}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
                  reader.readAsDataURL(file);
                  processImage(file);
                }}
                className={cn(
                  "flex h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t('ai.takePhoto')} / {t('ai.uploadFile')}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {isDragging ? '↓ Drop here' : 'Drag & drop or click'}
                </span>
              </div>
            )}

            {!previewUrl && !isProcessing && (
              <div className="space-y-2 text-center">
                <p className="text-xs text-muted-foreground">
                  {t('ai.supportedFormats')}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>{t('ai.multiUploadTip')}</strong>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quota Exceeded Dialog */}
      <Dialog open={showQuotaDialog} onOpenChange={setShowQuotaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              {t('ai.quotaExceeded')}
            </DialogTitle>
            <DialogDescription>
              {t('ai.quotaExceededDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t('ai.quotaExceededBody')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('ai.quotaContactBody')}
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQuotaDialog(false)}
              className="w-full sm:w-auto"
            >
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                window.location.href = 'mailto:contact@open-label.eu?subject=AI%20Label%20Scan%20Quota%20Increase%20Request';
              }}
              className="w-full sm:w-auto gap-2"
            >
              <Mail className="h-4 w-4" />
              {t('ai.contactUs')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
