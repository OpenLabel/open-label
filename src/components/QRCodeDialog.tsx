import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';


interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  productName: string;
  showSecuritySealOverlay?: boolean;
}

// Generate rounded hexagon path
function getRoundedHexagonPath(size: number) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2;
  const cornerRadius = radius * 0.2;
  
  const vertices = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    vertices.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  
  let path = '';
  for (let i = 0; i < 6; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % 6];
    const prev = vertices[(i + 5) % 6];
    
    const toPrev = { x: prev.x - current.x, y: prev.y - current.y };
    const toNext = { x: next.x - current.x, y: next.y - current.y };
    
    const lenPrev = Math.sqrt(toPrev.x ** 2 + toPrev.y ** 2);
    const lenNext = Math.sqrt(toNext.x ** 2 + toNext.y ** 2);
    
    const startPoint = {
      x: current.x + (toPrev.x / lenPrev) * cornerRadius,
      y: current.y + (toPrev.y / lenPrev) * cornerRadius,
    };
    const endPoint = {
      x: current.x + (toNext.x / lenNext) * cornerRadius,
      y: current.y + (toNext.y / lenNext) * cornerRadius,
    };
    
    if (i === 0) {
      path += `M ${startPoint.x} ${startPoint.y} `;
    }
    
    path += `Q ${current.x} ${current.y} ${endPoint.x} ${endPoint.y} `;
    
    if (i < 5) {
      const nextStartPoint = {
        x: vertices[(i + 1) % 6].x + (toNext.x / lenNext) * -cornerRadius,
        y: vertices[(i + 1) % 6].y + (toNext.y / lenNext) * -cornerRadius,
      };
      path += `L ${nextStartPoint.x} ${nextStartPoint.y} `;
    }
  }
  path += 'Z';
  return { path, centerX, centerY };
}

// Rounded hexagon SVG with text - creates a hexagon with curved corners and instruction text
function RoundedHexagonWithText({ size = 104 }: { size?: number }) {
  const { path, centerX, centerY } = getRoundedHexagonPath(size);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <path
        d={path}
        fill="white"
        stroke="#e5e5e5"
        strokeWidth="1"
      />
      <text
        x={centerX}
        y={centerY - 12}
        textAnchor="middle"
        fontSize="8"
        fontWeight="500"
        fill="#666"
      >
        Place security
      </text>
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        fontSize="8"
        fontWeight="500"
        fill="#666"
      >
        seals here
      </text>
      <text
        x={centerX}
        y={centerY + 18}
        textAnchor="middle"
        fontSize="6.5"
        fill="#999"
      >
        cypheme.com
      </text>
    </svg>
  );
}

export function QRCodeDialog({ 
  open, 
  onOpenChange, 
  url, 
  productName,
  showSecuritySealOverlay = false,
}: QRCodeDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = useCallback(() => {
    if (!qrContainerRef.current) return;

    // Get the QR code SVG
    const qrSvg = qrContainerRef.current.querySelector('svg');
    if (!qrSvg) return;

    const qrSize = 250;
    const padding = 16;
    const totalSize = qrSize + padding * 2;
    
    // Create a canvas to render the QR code
    const canvas = document.createElement('canvas');
    canvas.width = totalSize;
    canvas.height = totalSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalSize, totalSize);

    // Convert QR SVG to image
    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
      // Draw QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize);
      URL.revokeObjectURL(svgUrl);

      // If security seal overlay is enabled, draw it on top
      if (showSecuritySealOverlay) {
        const hexSize = 139;
        const { path, centerX, centerY } = getRoundedHexagonPath(hexSize);
        
        const hexX = totalSize / 2 - hexSize / 2;
        const hexY = totalSize / 2 - hexSize / 2;
        
        ctx.save();
        ctx.translate(hexX, hexY);
        
        const path2D = new Path2D(path);
        ctx.fillStyle = 'white';
        ctx.fill(path2D);
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 1;
        ctx.stroke(path2D);
        
        ctx.fillStyle = '#666';
        ctx.font = '500 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Place security', centerX, centerY - 12);
        ctx.fillText('seals here', centerX, centerY);
        
        ctx.fillStyle = '#999';
        ctx.font = '6.5px sans-serif';
        ctx.fillText('cypheme.com', centerX, centerY + 18);
        
        ctx.restore();
      }

      // Validate QR code before download using BarcodeDetector if available
      const performDownload = () => {
        const link = document.createElement('a');
        link.download = `${productName.replace(/[^a-z0-9]/gi, '_')}_qr.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };

      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const blob = await new Promise<Blob | null>(r => canvas.toBlob(r));
          if (blob) {
            const bitmap = await createImageBitmap(blob);
            const results = await detector.detect(bitmap);
            if (results.length > 0 && results[0].rawValue === url) {
              performDownload();
            } else if (results.length === 0) {
              console.warn('BarcodeDetector could not read QR — allowing download (QR was just generated)');
              performDownload();
            } else {
              toast.error(t('qrDialog.urlMismatch', 'QR code validation failed - URL does not match'));
              return;
            }
          } else {
            performDownload();
          }
        } catch (e) {
          console.warn('BarcodeDetector error, allowing download:', e);
          performDownload();
        }
      } else {
        // No BarcodeDetector available — trust the generated QR
        performDownload();
      }
    };
    img.src = svgUrl;
  }, [productName, showSecuritySealOverlay, url, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t('qrDialog.title')} - {productName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {url && (
            <div ref={qrContainerRef} className="rounded-lg border p-4 bg-white relative">
              <QRCodeSVG
                value={url}
                size={250}
                level="H"
                includeMargin={false}
              />
              {/* Only show security seal placeholder when counterfeit protection is enabled */}
              {showSecuritySealOverlay && <RoundedHexagonWithText size={139} />}
            </div>
          )}
          {/* Print size instruction when security seal is enabled */}
          {showSecuritySealOverlay && (
            <p className="text-xs text-muted-foreground text-center max-w-[250px]">
              {t('qrDialog.printSizeInstruction', 'Print at 1.8 × 1.8 cm. The hexagon corresponds to 1 cm for the security seal.')}
            </p>
          )}
          <div className="flex items-center gap-2 w-full max-w-sm">
            <div className="flex-1 text-sm text-muted-foreground bg-muted rounded-md px-3 py-2 truncate">
              {url}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(url, '_blank')}
              className="flex-shrink-0"
              title={t('qrDialog.openPassport', 'Open Passport')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              className="flex-shrink-0"
              title={t('qrDialog.copyLink')}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              className="flex-shrink-0"
              title={t('qrDialog.download')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
