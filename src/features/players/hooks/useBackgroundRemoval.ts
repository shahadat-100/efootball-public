import { useState, useEffect, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';

// In-memory cache: imageUrl → objectURL (persists for the session)
const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

/**
 * Given a player's coverImageUrl and profileImageUrl:
 *  - If coverImageUrl exists → use it directly (already a cutout)
 *  - Else → strip background from profileImageUrl via WASM AI model
 *
 * Returns { src, isCutout, loading }
 */
export function useBackgroundRemoval(
  coverImageUrl?: string,
  profileImageUrl?: string,
) {
  const [src, setSrc]         = useState<string | null>(coverImageUrl || profileImageUrl || null);
  const [isCutout, setIsCutout] = useState(!!coverImageUrl);
  const [loading, setLoading]   = useState(false);
  const mountedRef              = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // Case 1: has explicit cutout — nothing to do
    if (coverImageUrl) {
      setSrc(coverImageUrl);
      setIsCutout(true);
      setLoading(false);
      return;
    }

    // Case 2: no image at all
    if (!profileImageUrl) {
      setSrc(null);
      setIsCutout(false);
      setLoading(false);
      return;
    }

    // Case 3: profile image only → try to remove background
    const key = profileImageUrl;

    // Already cached
    if (cache.has(key)) {
      setSrc(cache.get(key)!);
      setIsCutout(true);
      setLoading(false);
      return;
    }

    // Show original while processing
    setSrc(profileImageUrl);
    setIsCutout(false);
    setLoading(true);

    // Deduplicate concurrent requests for the same image
    const getOrProcess = (): Promise<string> => {
      if (inFlight.has(key)) return inFlight.get(key)!;

      const promise = removeBackground(profileImageUrl, {
        publicPath: `https://unpkg.com/@imgly/background-removal/dist/`,
        output: { format: 'image/png', quality: 0.85 },
      })
        .then((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          cache.set(key, url);
          inFlight.delete(key);
          return url;
        })
        .catch(() => {
          // On failure → fall back to profile image as-is
          inFlight.delete(key);
          return profileImageUrl;
        });

      inFlight.set(key, promise);
      return promise;
    };

    getOrProcess().then(url => {
      if (!mountedRef.current) return;
      setSrc(url);
      setIsCutout(url !== profileImageUrl);
      setLoading(false);
    });
  }, [coverImageUrl, profileImageUrl]);

  return { src, isCutout, loading };
}
