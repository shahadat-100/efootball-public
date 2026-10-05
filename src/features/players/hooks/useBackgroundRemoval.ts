import { useState, useEffect, useRef } from 'react';

// In-memory cache for processed canvas cutouts
const cache = new Map<string, string>();

/**
 * Removes dark/black background from player images via fast client-side canvas flood-fill.
 * If coverImageUrl exists, it's used directly.
 */
export function useBackgroundRemoval(
  coverImageUrl?: string,
  profileImageUrl?: string,
) {
  const [src, setSrc] = useState<string | null>(coverImageUrl || profileImageUrl || null);
  const [isCutout, setIsCutout] = useState(!!coverImageUrl);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // 1. Explicit cutout exists
    if (coverImageUrl) {
      setSrc(coverImageUrl);
      setIsCutout(true);
      setLoading(false);
      return;
    }

    // 2. No image
    if (!profileImageUrl) {
      setSrc(null);
      setIsCutout(false);
      setLoading(false);
      return;
    }

    // 3. Cache check
    if (cache.has(profileImageUrl)) {
      const cached = cache.get(profileImageUrl)!;
      setSrc(cached);
      setIsCutout(true);
      setLoading(false);
      return;
    }

    setSrc(profileImageUrl);
    setLoading(true);

    let objectUrlToRevoke: string | null = null;

    fetch(profileImageUrl, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const objUrl = URL.createObjectURL(blob);
        objectUrlToRevoke = objUrl;

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            canvas.width = w;
            canvas.height = h;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
              if (mountedRef.current) {
                setSrc(profileImageUrl);
                setIsCutout(false);
                setLoading(false);
              }
              return;
            }

            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;

            // Check if corners are dark
            const isDark = (r: number, g: number, b: number) => r < 60 && g < 60 && b < 60;
            const topLeftDark = isDark(data[0], data[1], data[2]);
            const topRightDark = isDark(data[(w - 1) * 4], data[(w - 1) * 4 + 1], data[(w - 1) * 4 + 2]);

            if (!topLeftDark && !topRightDark) {
              if (mountedRef.current) {
                setSrc(profileImageUrl);
                setIsCutout(false);
                setLoading(false);
              }
              return;
            }

            // BFS Flood-fill from borders
            const visited = new Uint8Array(w * h);
            const queue = new Int32Array(w * h * 2);
            let head = 0;
            let tail = 0;

            const isDarkPixel = (idx: number) => {
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              return r < 60 && g < 60 && b < 60;
            };

            // Seed top & bottom
            for (let x = 0; x < w; x++) {
              queue[tail++] = x;
              queue[tail++] = 0;
              queue[tail++] = x;
              queue[tail++] = h - 1;
            }
            // Seed left & right
            for (let y = 0; y < h; y++) {
              queue[tail++] = 0;
              queue[tail++] = y;
              queue[tail++] = w - 1;
              queue[tail++] = y;
            }

            while (head < tail) {
              const x = queue[head++];
              const y = queue[head++];
              const pIdx = y * w + x;

              if (visited[pIdx]) continue;
              visited[pIdx] = 1;

              const dIdx = pIdx * 4;
              if (isDarkPixel(dIdx)) {
                data[dIdx + 3] = 0; // Make transparent

                if (x > 0 && !visited[pIdx - 1]) {
                  queue[tail++] = x - 1;
                  queue[tail++] = y;
                }
                if (x < w - 1 && !visited[pIdx + 1]) {
                  queue[tail++] = x + 1;
                  queue[tail++] = y;
                }
                if (y > 0 && !visited[pIdx - w]) {
                  queue[tail++] = x;
                  queue[tail++] = y - 1;
                }
                if (y < h - 1 && !visited[pIdx + w]) {
                  queue[tail++] = x;
                  queue[tail++] = y + 1;
                }
              }
            }

            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            cache.set(profileImageUrl, dataUrl);

            if (mountedRef.current) {
              setSrc(dataUrl);
              setIsCutout(true);
              setLoading(false);
            }
          } catch (err) {
            console.warn('Canvas flood fill failed, fallback:', err);
            if (mountedRef.current) {
              setSrc(profileImageUrl);
              setIsCutout(false);
              setLoading(false);
            }
          }
        };

        img.onerror = () => {
          if (mountedRef.current) {
            setSrc(profileImageUrl);
            setIsCutout(false);
            setLoading(false);
          }
        };

        img.src = objUrl;
      })
      .catch(() => {
        if (mountedRef.current) {
          setSrc(profileImageUrl);
          setIsCutout(false);
          setLoading(false);
        }
      });

    return () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [coverImageUrl, profileImageUrl]);

  return { src, isCutout, loading };
}
