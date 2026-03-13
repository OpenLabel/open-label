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

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download, ExternalLink, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';


interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  productName: string;
  showSecuritySealOverlay?: boolean;
  wineIngredientsText?: string;
  wineEnergyText?: string;
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
  wineIngredientsText,
  wineEnergyText,
}: QRCodeDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = useCallback(() => {
    if (!qrContainerRef.current) return;

    const qrSvg = qrContainerRef.current.querySelector('svg.qr-code-svg') || qrContainerRef.current.querySelector('svg');
    if (!qrSvg) return;

    const qrSize = 250;
    const padding = 16;
    const fontSize = 14;
    const lineHeight = 18;

    const ingredientsHeight = wineIngredientsText ? lineHeight + 6 : 0;
    const energyHeight = wineEnergyText ? lineHeight + 6 : 0;
    
    const totalWidth = qrSize + padding * 2;
    const totalHeight = padding + ingredientsHeight + qrSize + energyHeight + padding;
    
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw ingredients label above QR code (single centered word)
    let yOffset = padding;
    if (wineIngredientsText) {
      ctx.fillStyle = '#333';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(wineIngredientsText, totalWidth / 2, yOffset + fontSize);
      yOffset += lineHeight + 6;
    }

    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
      const qrY = yOffset;
      ctx.drawImage(img, padding, qrY, qrSize, qrSize);
      URL.revokeObjectURL(svgUrl);

      if (showSecuritySealOverlay) {
        const hexSize = 139;
        const { path, centerX, centerY } = getRoundedHexagonPath(hexSize);
        const hexX = totalWidth / 2 - hexSize / 2;
        const hexY = qrY + qrSize / 2 - hexSize / 2;
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

      // Draw energy text below QR code
      if (wineEnergyText) {
        ctx.fillStyle = '#333';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(wineEnergyText, totalWidth / 2, qrY + qrSize + 6 + fontSize);
      }

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
              console.warn('BarcodeDetector could not read QR — allowing download');
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
        performDownload();
      }
    };
    img.src = svgUrl;
  }, [productName, showSecuritySealOverlay, url, t, wineIngredientsText, wineEnergyText]);

  const handleDownloadSvg = useCallback(() => {
    if (!qrContainerRef.current) return;

    const qrSvg = qrContainerRef.current.querySelector('svg.qr-code-svg') || qrContainerRef.current.querySelector('svg');
    if (!qrSvg) return;

    const clone = qrSvg.cloneNode(true) as SVGSVGElement;
    const qrSize = 250;
    const padding = 16;
    const fontSize = 14;
    const lineHeight = 18;

    const ingredientsHeight = wineIngredientsText ? lineHeight + 6 : 0;
    const energyHeight = wineEnergyText ? lineHeight + 6 : 0;

    const totalWidth = qrSize + padding * 2;
    const totalHeight = padding + ingredientsHeight + qrSize + energyHeight + padding;

    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    wrapper.setAttribute('width', String(totalWidth));
    wrapper.setAttribute('height', String(totalHeight));
    wrapper.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', String(totalWidth));
    bg.setAttribute('height', String(totalHeight));
    bg.setAttribute('fill', 'white');
    wrapper.appendChild(bg);

    // Draw ingredients label above QR (single centered word)
    let yOffset = padding;
    if (wineIngredientsText) {
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', String(totalWidth / 2));
      textEl.setAttribute('y', String(yOffset + fontSize));
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('font-size', String(fontSize));
      textEl.setAttribute('font-weight', 'bold');
      textEl.setAttribute('fill', '#333');
      textEl.setAttribute('font-family', 'sans-serif');
      textEl.textContent = wineIngredientsText;
      wrapper.appendChild(textEl);
      yOffset += lineHeight + 6;
    }

    // QR code
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${padding}, ${yOffset})`);
    while (clone.childNodes.length > 0) {
      g.appendChild(clone.childNodes[0]);
    }
    clone.getAttribute('viewBox') && g.setAttribute('data-viewbox', clone.getAttribute('viewBox')!);
    wrapper.appendChild(g);

    // Security seal overlay
    if (showSecuritySealOverlay) {
      const hexSize = 139;
      const { path, centerX, centerY } = getRoundedHexagonPath(hexSize);
      const hexX = totalWidth / 2 - hexSize / 2;
      const hexY = yOffset + qrSize / 2 - hexSize / 2;

      const sealGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      sealGroup.setAttribute('transform', `translate(${hexX}, ${hexY})`);

      const hexPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hexPath.setAttribute('d', path);
      hexPath.setAttribute('fill', 'white');
      hexPath.setAttribute('stroke', '#e5e5e5');
      hexPath.setAttribute('stroke-width', '1');
      sealGroup.appendChild(hexPath);

      const addText = (content: string, x: number, y: number, size: string, weight: string, color: string) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', String(x));
        text.setAttribute('y', String(y));
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', size);
        text.setAttribute('font-weight', weight);
        text.setAttribute('fill', color);
        text.textContent = content;
        sealGroup.appendChild(text);
      };

      addText('Place security', centerX, centerY - 12, '8', '500', '#666');
      addText('seals here', centerX, centerY, '8', '500', '#666');
      addText('cypheme.com', centerX, centerY + 18, '6.5', '400', '#999');

      wrapper.appendChild(sealGroup);
    }

    // Energy text below QR
    if (wineEnergyText) {
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', String(totalWidth / 2));
      textEl.setAttribute('y', String(yOffset + qrSize + 6 + fontSize));
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('font-size', String(fontSize));
      textEl.setAttribute('font-weight', 'bold');
      textEl.setAttribute('fill', '#333');
      textEl.setAttribute('font-family', 'sans-serif');
      textEl.textContent = wineEnergyText;
      wrapper.appendChild(textEl);
    }

    const svgData = new XMLSerializer().serializeToString(wrapper);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${productName.replace(/[^a-z0-9]/gi, '_')}_qr.svg`;
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }, [productName, showSecuritySealOverlay, wineIngredientsText, wineEnergyText]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t('qrDialog.title')} - {productName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {url && (
            <div ref={qrContainerRef} className="rounded-lg border p-4 bg-white relative">
              {/* Wine ingredients label above QR code */}
              {wineIngredientsText && (
                <p className="text-sm font-bold leading-tight text-gray-700 mb-2 text-center w-[250px]">
                  {wineIngredientsText}
                </p>
              )}
              <QRCodeSVG
                value={url}
                size={250}
                level="H"
                includeMargin={false}
                className="qr-code-svg"
              />
              {/* Only show security seal placeholder when counterfeit protection is enabled */}
              {showSecuritySealOverlay && <RoundedHexagonWithText size={139} />}
              {/* Wine energy text below QR code */}
              {wineEnergyText && (
                <p className="text-sm font-bold leading-tight text-gray-700 mt-2 text-center w-[250px]">
                  {wineEnergyText}
                </p>
              )}
            </div>
          )}
          {/* Print size instruction */}
          {showSecuritySealOverlay && (
            <p className="text-xs text-muted-foreground text-center max-w-[250px]">
              {(wineIngredientsText || wineEnergyText)
                ? t('qrDialog.printSizeInstructionWine', 'Print at 1.8 cm wide. Height varies with content. The hexagon corresponds to 1 cm for the security seal.')
                : t('qrDialog.printSizeInstruction', 'Print at 1.8 × 1.8 cm. The hexagon corresponds to 1 cm for the security seal.')}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  title={t('qrDialog.download')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadSvg}>
                  {t('qrDialog.downloadSvg', 'SVG (print)')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPng}>
                  {t('qrDialog.downloadPng', 'PNG (web)')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
