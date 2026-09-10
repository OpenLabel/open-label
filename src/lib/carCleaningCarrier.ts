export { CAR_CLEANING_CARRIER_COPY } from '../../supabase/functions/_shared/carCleaningPlatformCopy';

export interface CarCleaningCarrierDescriptor {
  passportUri: string;
  machineReadableUri?: string;
}

function publicHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.port
      || !url.hostname.includes('.') || /^(?:localhost|127\.|0\.|\[)/i.test(url.hostname)) return null;
    return url;
  } catch { return null; }
}

/** A resolver URI is not evidence of registry registration or a standards-issued product identifier. */
export function buildCarCleaningCarrier(url: string, machineReadableUrl?: string): CarCleaningCarrierDescriptor | null {
  const uri = publicHttpsUrl(url);
  if (!uri || uri.search || !/^\/p\/(?:[a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$/.test(uri.pathname) || uri.href !== url) return null;
  if (machineReadableUrl && !publicHttpsUrl(machineReadableUrl)) return null;
  return { passportUri: uri.href, ...(machineReadableUrl ? { machineReadableUri: machineReadableUrl } : {}) };
}

/** Fixed-width URI wrapping keeps every encoded character in the printable fallback URI. */
export function carrierTextLines(text: string, columns = 42): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  const width = Math.max(1, Math.floor(columns));
  for (let index = 0; index < chars.length; index += width) lines.push(chars.slice(index, index + width).join(''));
  return lines;
}

export function carrierInstructionLines(text: string, columns = 44): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > columns) { lines.push(line); line = ''; }
    if (word.length > columns) {
      const parts = carrierTextLines(word, columns);
      lines.push(...parts.slice(0, -1));
      line = parts[parts.length - 1] || '';
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}
