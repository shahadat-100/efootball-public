import { toPng, toJpeg } from 'html-to-image';

/**
 * Captures a DOM element as an image and triggers a download.
 * Uses html-to-image with 2x pixel ratio for crisp output.
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

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to download card:', err);
  }
}
