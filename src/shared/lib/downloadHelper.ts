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
 * Detects if the current device is mobile (iOS or Android).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod|Android/i.test(ua);
}
