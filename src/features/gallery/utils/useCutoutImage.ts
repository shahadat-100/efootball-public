import { useState, useEffect } from 'react';

/**
 * Removes dark/black background from an image using canvas BFS flood-fill
 * from all 4 perimeter edges. Works for pure black, near-black, and dark-navy backgrounds.
 */
export function useCutoutImage(src?: string): string {
  const [processedSrc, setProcessedSrc] = useState<string>(src || '');

  useEffect(() => {
    if (!src) {
      setProcessedSrc('');
      return;
    }

    // Reset immediately to original while processing
    setProcessedSrc(src);

    let isMounted = true;
    let objectUrlToRevoke: string | null = null;

    const processImage = (imageSrc: string, isObjectUrl: boolean) => {
      const img = new Image();
      if (!isObjectUrl) img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (!w || !h) {
            if (isMounted) setProcessedSrc(src);
            return;
          }
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

          // 1. Check if the image is ALREADY a transparent PNG cutout.
          // If perimeter pixels are already transparent (alpha < 50), do NOT process.
          let transparentPerimeterCount = 0;
          const totalPerimeterSamples = (w + h) * 2;

          for (let x = 0; x < w; x++) {
            if (data[x * 4 + 3] < 50) transparentPerimeterCount++;
            if (data[((h - 1) * w + x) * 4 + 3] < 50) transparentPerimeterCount++;
          }
          for (let y = 1; y < h - 1; y++) {
            if (data[(y * w) * 4 + 3] < 50) transparentPerimeterCount++;
            if (data[(y * w + w - 1) * 4 + 3] < 50) transparentPerimeterCount++;
          }

          // If more than 2% of the perimeter is already transparent, it's already a transparent cutout!
          if (transparentPerimeterCount > totalPerimeterSamples * 0.02) {
            if (isMounted) setProcessedSrc(src);
            return;
          }

          // Luminance-based dark check for OPAQUE black background images
          const isOpaqueDark = (di: number) => {
            const r = data[di], g = data[di + 1], b = data[di + 2], a = data[di + 3];
            if (a < 200) return false; // Ignore already transparent pixels
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            return luminance < 75; // dark background
          };

          // Check if any perimeter pixel is dark
          let hasAnyDarkPerimeter = false;
          for (let x = 0; x < w && !hasAnyDarkPerimeter; x++) {
            if (isOpaqueDark(x * 4) || isOpaqueDark(((h - 1) * w + x) * 4)) hasAnyDarkPerimeter = true;
          }
          for (let y = 0; y < h && !hasAnyDarkPerimeter; y++) {
            if (isOpaqueDark(y * w * 4) || isOpaqueDark((y * w + w - 1) * 4)) hasAnyDarkPerimeter = true;
          }

          if (!hasAnyDarkPerimeter) {
            // No dark background — use original
            if (isMounted) setProcessedSrc(src);
            return;
          }

          // BFS flood-fill from ALL perimeter pixels inward
          const visited = new Uint8Array(w * h);
          const qx: number[] = [];
          const qy: number[] = [];

          const seed = (x: number, y: number) => {
            const pi = y * w + x;
            if (!visited[pi] && isOpaqueDark(pi * 4)) {
              visited[pi] = 1;
              qx.push(x);
              qy.push(y);
            }
          };

          for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
          for (let y = 1; y < h - 1; y++) { seed(0, y); seed(w - 1, y); }

          let qi = 0;
          while (qi < qx.length) {
            const cx = qx[qi], cy = qy[qi];
            qi++;
            const pi = cy * w + cx;
            data[pi * 4 + 3] = 0; // Make transparent

            const neighbors: [number, number][] = [
              [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1],
            ];
            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const npi = ny * w + nx;
                if (!visited[npi] && isOpaqueDark(npi * 4)) {
                  visited[npi] = 1;
                  qx.push(nx);
                  qy.push(ny);
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const resultPng = canvas.toDataURL('image/png');
          if (isMounted) setProcessedSrc(resultPng);
        } catch (err) {
          console.warn('[useCutoutImage] canvas error, using original:', err);
          if (isMounted) setProcessedSrc(src);
        }
      };

      img.onerror = () => {
        if (isMounted) setProcessedSrc(src);
      };

      img.src = imageSrc;
    };

    // Try fetch+blob first (avoids canvas taint for cross-origin images)
    fetch(src, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        objectUrlToRevoke = objectUrl;
        processImage(objectUrl, true);
      })
      .catch(() => {
        // Fallback: try direct with crossOrigin attribute
        processImage(src, false);
      });

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [src]);

  return processedSrc;
}
