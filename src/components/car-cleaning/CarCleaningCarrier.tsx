import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { buildCarCleaningCarrier, CAR_CLEANING_CARRIER_COPY, carrierInstructionLines, carrierTextLines } from '@/lib/carCleaningCarrier';

export interface CarCleaningCarrierProps {
  url: string;
  productName: string;
  machineReadableUrl?: string;
}

/** A printable carrier draft. Physical affixing, scan testing and identifier assurance remain supplier work. */
export function CarCleaningCarrier({ url, productName, machineReadableUrl }: CarCleaningCarrierProps) {
  const { t } = useTranslation();
  const copy = (key: keyof typeof CAR_CLEANING_CARRIER_COPY) => t(`carCleaning.carrier.${key}`, CAR_CLEANING_CARRIER_COPY[key]);
  const svgRef = useRef<SVGSVGElement>(null);
  const carrier = buildCarCleaningCarrier(url, machineReadableUrl);
  if (!carrier) return <p className="text-sm text-muted-foreground">{copy('invalidUrl')}</p>;

  const instructionLines = carrierInstructionLines(copy('scan'));
  const uriLines = carrierTextLines(carrier.passportUri);
  const qrY = 20 + instructionLines.length * 18;
  const uriY = qrY + 288 + 20;
  const height = uriY + uriLines.length * 16 + 12;

  function downloadSvg() {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${productName.replace(/[^a-z0-9]/gi, '_').slice(0, 80) || 'product'}_carrier.svg`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  return <section className="space-y-3 rounded-lg border p-4" aria-label={copy('title')}>
    <h3 className="font-semibold">{copy('title')}</h3>
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width="384" height={height} viewBox={`0 0 384 ${height}`} className="h-auto max-w-full bg-white" role="img" aria-label={`${copy('title')}: ${productName}`}>
      <title>{productName}</title>
      <metadata>{JSON.stringify({ format: 'open-label-carrier-v1', passport_uri: carrier.passportUri, ...(carrier.machineReadableUri ? { structured_data_uri: carrier.machineReadableUri } : {}) })}</metadata>
      <rect width="384" height={height} fill="white" />
      {instructionLines.map((line, index) => <text key={index} x="192" y={22 + index * 18} textAnchor="middle" fontSize="14" fontFamily="sans-serif" fill="black">{line}</text>)}
      <QRCodeSVG data-carrier-qr="true" value={carrier.passportUri} size={288} x={48} y={qrY} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" />
      {uriLines.map((line, index) => <text key={index} x="192" y={uriY + index * 16} textAnchor="middle" fontSize="12" fontFamily="monospace" fill="black">{line}</text>)}
    </svg>
    <div className="flex flex-wrap gap-3 items-center">
      <Button type="button" variant="outline" onClick={downloadSvg}>{copy('download')}</Button>
      {carrier.machineReadableUri && <a className="text-sm underline" href={carrier.machineReadableUri} target="_blank" rel="noopener noreferrer">{copy('structuredData')}</a>}
    </div>
    <p className="text-sm text-muted-foreground">{copy('physicalLabel')}</p>
    <p className="text-sm text-muted-foreground">{copy('verification')}</p>
  </section>;
}
