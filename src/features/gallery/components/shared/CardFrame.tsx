import React from 'react';

interface CardFrameProps {
  children: React.ReactNode;
  /** Aspect ratio preset */
  aspect?: '1:1' | '9:16' | '16:9' | '4:5';
  /** Ref forwarded for html-to-image capture */
  cardRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const ASPECT_MAP: Record<string, { width: number; height: number }> = {
  '1:1': { width: 600, height: 600 },
  '9:16': { width: 540, height: 960 },
  '16:9': { width: 960, height: 540 },
  '4:5': { width: 600, height: 750 },
};

/**
 * Shared card wrapper — provides consistent sizing, club logo watermark,
 * and a capture-ready container for html-to-image export.
 */
export function CardFrame({ children, aspect = '1:1', cardRef, className = '' }: CardFrameProps) {
  const { width, height } = ASPECT_MAP[aspect] || ASPECT_MAP['1:1'];

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Card content */}
      {children}

      {/* Club logo watermark — bottom right */}
      <div className="absolute bottom-3 right-3 z-50 opacity-70">
        <img
          src="/images/club-logo.jpg"
          alt="Club"
          crossOrigin="anonymous"
          style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
