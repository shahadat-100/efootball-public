import { toPng, toJpeg } from 'html-to-image';
import { dataUrlToBlob } from '@/shared/lib/downloadHelper';

/**
 * Captures a DOM element as an image and triggers a download.
 * Uses html-to-image with 2x pixel ratio for crisp output.
 * Safely handles mobile and in-app browsers with Blob URLs and Web Share.
 */
export async function downloadCard(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpg' = 'png'
): Promise<void> {
  try {
    const options = {
      pixelRatio: 2,
      cacheBust: true,
      // Allow cross-origin images (e.g. Supabase-hosted profile images)
      fetchRequestInit: { mode: 'cors' as RequestMode },
    };

    const dataUrl = format === 'png'
      ? await toPng(element, { ...options, quality: 1 })
      : await toJpeg(element, { ...options, quality: 0.95, backgroundColor: '#ffffff' });

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const fullName = `${filename}.${format}`;
    const blob = dataUrlToBlob(dataUrl);

    // 1. Try Web Share API on mobile
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const file = new File([blob], fullName, { type: mimeType });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
          });
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Blob URL download (prevents browser crash from giant base64 data URLs)
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fullName;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 3000);
  } catch (err) {
    console.error('Failed to download card:', err);
  }
}
