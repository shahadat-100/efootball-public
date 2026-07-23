import React from 'react';

interface CardFrameProps {
  children: React.ReactNode;
  /** Aspect ratio preset */
  aspect?: '1:1' | '9:16' | '16:9' | '4:5';
  /** Background image path */
  bgImage?: string;
  /** Ref forwarded for html-to-image capture */
  cardRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const ASPECT_MAP: Record<string, { width: number; height: number; aspectStyle: string }> = {
  '1:1': { width: 600, height: 600, aspectStyle: 'aspect-square' },
  '9:16': { width: 540, height: 960, aspectStyle: 'aspect-[9/16]' },
  '16:9': { width: 960, height: 540, aspectStyle: 'aspect-[16/9]' },
  '4:5': { width: 600, height: 750, aspectStyle: 'aspect-[4/5]' },
};

/**
 * Shared card wrapper — provides aspect ratios, background images,
 * club logo watermark, and capture-ready container for html-to-image export.
 */
export function CardFrame({ children, aspect = '4:5', bgImage, cardRef, className = '' }: CardFrameProps) {
  const { width, height } = ASPECT_MAP[aspect] || ASPECT_MAP['4:5'];

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden bg-slate-950 text-white shadow-2xl ${className}`}
      style={{
        width,
        height,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Custom Background Image Overlay */}
      {bgImage && (
        <img
          src={bgImage}
          alt="Card Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          crossOrigin="anonymous"
        />
      )}

      {/* Card Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-6">
        {children}
      </div>

      {/* Club logo watermark — bottom right */}
      <div className="absolute bottom-3 right-3 z-50 opacity-80 pointer-events-none">
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
