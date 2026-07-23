import React from 'react';

interface CardFrameProps {
  children: React.ReactNode;
  /** Aspect ratio preset */
  aspect?: '1:1' | '9:16' | '16:9' | '4:5';
  /** Optional full-bleed background image */
  bgImage?: string;
  /** Ref forwarded for html-to-image capture */
  cardRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const ASPECT_MAP: Record<string, { width: number; height: number }> = {
  '1:1':  { width: 600, height: 600 },
  '9:16': { width: 540, height: 960 },
  '16:9': { width: 960, height: 540 },
  '4:5':  { width: 600, height: 750 },
};

export function CardFrame({ children, aspect = '4:5', bgImage, cardRef, className = '' }: CardFrameProps) {
  const { width, height } = ASPECT_MAP[aspect] || ASPECT_MAP['4:5'];

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden bg-[#0d0d0d] text-white shadow-2xl ${className}`}
      style={{ width, height, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Optional full-bleed background */}
      {bgImage && (
        <img
          src={bgImage}
          alt="Card Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          crossOrigin="anonymous"
        />
      )}

      {/* ── Club logo — centred, full-card watermark at 30% opacity ────── */}
      <div
        className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.30 }}
      >
        <img
          src="/images/club-logo.jpg"
          alt="Club watermark"
          crossOrigin="anonymous"
          style={{
            width:  Math.round(Math.min(width, height) * 0.65),
            height: Math.round(Math.min(width, height) * 0.65),
            objectFit: 'contain',
            filter: 'grayscale(30%)',
          }}
        />
      </div>

      {/* ── Card content layer ──────────────────────────────────────────── */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
