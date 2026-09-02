
import qrcode from 'qrcode-generator';

const ERROR_CORRECTION = 'M' as const;

const QUIET_ZONE = 4;

export interface QrOptions {
  size?: number;
  title?: string;
}

const DARK = '#000000';
const LIGHT = '#ffffff';

export function qrSvg(text: string, options: QrOptions = {}): string | null {
  const { size = 180, title = 'QR code' } = options;
  if (!text) return null;

  let qr: ReturnType<typeof qrcode>;
  try {
    qr = qrcode(0, ERROR_CORRECTION);
    qr.addData(text);
    qr.make();
  } catch {
    return null;
  }

  const count = qr.getModuleCount();
  const span = count + QUIET_ZONE * 2;

  let path = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        path += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${span} ${span}" ` +
    `width="${size}" height="${size}" role="img" aria-label="${escapeAttribute(title)}" ` +
    `shape-rendering="crispEdges">` +
    `<rect width="${span}" height="${span}" fill="${LIGHT}"/>` +
    `<path d="${path}" fill="${DARK}"/>` +
    `</svg>`
  );
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
