import { useState, useEffect } from 'react';
import { imageUrlToDataUrl } from '@/shared/lib/downloadHelper';

/**
 * Returns the player cutout / cover image source.
 * Preserves the original image and transparent cutouts without destructive pixel manipulation.
 * Automatically pre-inlines remote URLs into base64 Data URLs so mobile browsers
 * never drop cutout images when exporting cards.
 */
export function useCutoutImage(src?: string): string {
  const [dataUrl, setDataUrl] = useState<string>(src || '');

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setDataUrl('');
      return;
    }

    if (src.startsWith('data:')) {
      setDataUrl(src);
      return;
    }

    // Display original URL immediately for responsive UI
    setDataUrl(src);

    imageUrlToDataUrl(src)
      .then((res) => {
        if (isMounted && res && res.startsWith('data:')) {
          setDataUrl(res);
        }
      })
      .catch((err) => {
        console.warn('Failed to pre-inline cutout image:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  return dataUrl;
}

