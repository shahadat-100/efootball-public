/**
 * Utilities for robust mobile image downloads and in-app browser handling (Facebook, Instagram, Messenger).
 */

/**
 * Converts a base64 data URL to a binary Blob safely without freezing the browser.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0]?.split(':')[1] || 'image/png';
  const byteCharacters = atob(parts[1] || '');
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: contentType });
}

/**
 * Detects whether the current page is running inside a social in-app browser (e.g. Facebook, Instagram, Messenger, TikTok, Line, WeChat).
 * These webviews routinely block standard anchor downloads (<a download href="...">) causing "Page not found or maybe deleted" errors.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
  return (
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('instagram') ||
    ua.includes('line') ||
    ua.includes('micromessenger') ||
    ua.includes('snapchat') ||
    ua.includes('tiktok') ||
    ua.includes('twitter')
  );
}

/**
 * Detects whether the device is an iPad (including iPadOS where userAgent reports as Macintosh).
 */
export function isIPadDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /iPad/i.test(ua) ||
    (ua.includes('Macintosh') && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects if the current device is mobile or tablet (iPhone, iPad, iPod, Android).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPod|Android/i.test(ua) || isIPadDevice();
}

/**
 * Safely converts an image URL to a base64 Data URL.
 * Solves cross-origin (CORS), browser cache poisoning, and mobile WebKit / WebView issues
 * where external images are silently dropped during canvas / html-to-image export on mobile devices.
 */
export async function imageUrlToDataUrl(url: string): Promise<string> {
  if (!url || typeof window === 'undefined') return '';
  if (url.startsWith('data:')) return url;

  // 1. First attempt: fetch with CORS and cache-busting timestamp
  try {
    const separator = url.includes('?') ? '&' : '?';
    const cacheBustedUrl = `${url}${separator}_cb=${Date.now()}`;
    const res = await fetch(cacheBustedUrl, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
    });

    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') resolve(reader.result);
          else reject(new Error('FileReader did not return string'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      if (dataUrl && dataUrl.startsWith('data:image')) {
        return dataUrl;
      }
    }
  } catch (fetchErr) {
    console.warn('imageUrlToDataUrl fetch attempt failed, trying HTMLImage fallback:', fetchErr);
  }

  // 2. Second attempt: HTML Image element + Canvas
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const separator = url.includes('?') ? '&' : '?';
      img.src = `${url}${separator}_cb=${Date.now()}`;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 500;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(url);
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };

      img.onerror = (err) => reject(err);
    });

    if (dataUrl && dataUrl.startsWith('data:image')) {
      return dataUrl;
    }
  } catch (canvasErr) {
    console.warn('imageUrlToDataUrl canvas fallback failed:', canvasErr);
  }

  return url;
}
