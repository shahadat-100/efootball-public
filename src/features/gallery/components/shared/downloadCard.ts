import { toPng, toJpeg } from 'html-to-image';
import { dataUrlToBlob, isMobileDevice, imageUrlToDataUrl } from '@/shared/lib/downloadHelper';

/**
 * Captures a DOM element as an image and triggers a download.
 * Uses html-to-image with 2x pixel ratio for crisp output.
 * Safely handles mobile and in-app browsers with pre-inlined images, Blob URLs, and Web Share.
 */
export async function downloadCard(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpg' = 'png'
): Promise<void> {
  try {
    const mobile = isMobileDevice();

    // 1. Pre-inline all <img> elements inside the card to base64 Data URLs.
    // This prevents mobile browsers (iOS Safari, Android Chrome, in-app webviews)
    // from dropping remote or CORS images during canvas export.
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(async (img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
          try {
            const dataUrl = await imageUrlToDataUrl(src);
            if (dataUrl && dataUrl.startsWith('data:')) {
              img.setAttribute('src', dataUrl);
            }
          } catch (e) {
            console.warn('Failed to inline image for card export:', e);
          }
        }
      })
    );

    // 2. Ensure all images are fully decoded in GPU memory
    await Promise.all(
      images.map(async (img) => {
        if (img.decode) {
          try {
            await img.decode();
          } catch {
            // ignore decode error
          }
        } else if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }
      })
    );

    const options = {
      pixelRatio: 2,
      cacheBust: true,
      // Allow cross-origin images (e.g. Supabase-hosted profile images)
      fetchRequestInit: { mode: 'cors' as RequestMode },
    };

    // 3. WebKit warmup pass on mobile to ensure foreignObject rasterization paints all layers
    if (mobile) {
      try {
        if (format === 'png') {
          await toPng(element, { ...options, quality: 0.95 });
        } else {
          await toJpeg(element, { ...options, quality: 0.9, backgroundColor: '#ffffff' });
        }
        await new Promise((r) => setTimeout(r, 60));
      } catch (warmupErr) {
        // ignore warmup pass errors
      }
    }

    const dataUrl = format === 'png'
      ? await toPng(element, { ...options, quality: 1 })
      : await toJpeg(element, { ...options, quality: 0.95, backgroundColor: '#ffffff' });

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const fullName = `${filename}.${format}`;
    const blob = dataUrlToBlob(dataUrl);

    // 4. Try Web Share API on mobile (native share sheet with "Save Image")
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

    // 5. Blob URL download (prevents browser crash from giant base64 data URLs)
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
