import { useState, useEffect } from 'react';

/**
 * Automatically removes solid black or near-black background from an image
 * using canvas flood-fill starting from the outer image borders.
 * This guarantees true transparency for player cutout images even if saved as black-background JPEG.
 */
export function useCutoutImage(src?: string): string {
  const [processedSrc, setProcessedSrc] = useState<string>(src || '');

  useEffect(() => {
    if (!src) {
      setProcessedSrc('');
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          if (isMounted) setProcessedSrc(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Check if the corner pixels are dark (black background indicator)
        const topLeftDark = (data[0] < 40 && data[1] < 40 && data[2] < 40);
        const topRightDark = (data[(w - 1) * 4] < 40 && data[(w - 1) * 4 + 1] < 40 && data[(w - 1) * 4 + 2] < 40);

        if (!topLeftDark && !topRightDark) {
          // Image does not have black background, use as is
          if (isMounted) setProcessedSrc(src);
          return;
        }

        // BFS flood fill from all perimeter pixels inwards to remove background
        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h * 2);
        let head = 0;
        let tail = 0;

        const isDarkBg = (dataIdx: number) => {
          const r = data[dataIdx];
          const g = data[dataIdx + 1];
          const b = data[dataIdx + 2];
          // Near black pixel threshold
          return r < 40 && g < 40 && b < 40;
        };

        // Seed top and bottom borders
        for (let x = 0; x < w; x++) {
          queue[tail++] = x;
          queue[tail++] = 0;
          queue[tail++] = x;
          queue[tail++] = h - 1;
        }

        // Seed left and right borders
        for (let y = 0; y < h; y++) {
          queue[tail++] = 0;
          queue[tail++] = y;
          queue[tail++] = w - 1;
          queue[tail++] = y;
        }

        while (head < tail) {
          const x = queue[head++];
          const y = queue[head++];
          const pixelIdx = y * w + x;

          if (visited[pixelIdx]) continue;
          visited[pixelIdx] = 1;

          const dataIdx = pixelIdx * 4;
          if (isDarkBg(dataIdx)) {
            data[dataIdx + 3] = 0; // Set Alpha to 0 (Transparent)

            // 4-way neighbors
            if (x > 0 && !visited[pixelIdx - 1]) {
              queue[tail++] = x - 1;
              queue[tail++] = y;
            }
            if (x < w - 1 && !visited[pixelIdx + 1]) {
              queue[tail++] = x + 1;
              queue[tail++] = y;
            }
            if (y > 0 && !visited[pixelIdx - w]) {
              queue[tail++] = x;
              queue[tail++] = y - 1;
            }
            if (y < h - 1 && !visited[pixelIdx + w]) {
              queue[tail++] = x;
              queue[tail++] = y + 1;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL('image/png');
        if (isMounted) setProcessedSrc(transparentDataUrl);
      } catch (err) {
        console.warn('Cutout transparency processing failed, using original src:', err);
        if (isMounted) setProcessedSrc(src);
      }
    };

    img.onerror = () => {
      if (isMounted) setProcessedSrc(src);
    };

    img.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return processedSrc;
}
