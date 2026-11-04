import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Copy, Check, Shield } from 'lucide-react';

interface TournamentPlayerCardProps {
  playerName: string;
  playerImageUrl?: string | null;
  gameId: string;
  deviceModel: string;
  tournamentTitle?: string;
  seasonName?: string;
  onDownloaded?: (dataUrl: string) => void;
}

const GOLD = '#c89850';
const NAVY = '#00265a';

export const TournamentPlayerCard: React.FC<TournamentPlayerCardProps> = ({
  playerName,
  playerImageUrl,
  gameId,
  deviceModel,
  tournamentTitle = 'EFOOTBALL CHAMPIONSHIP',
  onDownloaded
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Download Image (High Res 4:5)
  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 3, // Ultra-crisp 3x resolution for Facebook
      });

      const link = document.createElement('a');
      link.download = `${playerName.toLowerCase().replace(/\s+/g, '_')}_card.png`;
      link.href = dataUrl;
      link.click();

      if (onDownloaded) {
        onDownloaded(dataUrl);
      }
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Handle Copy Facebook Caption
  const handleCopyCaption = () => {
    const caption = `⚽ Officially registered for ${tournamentTitle}! 🔥\n\n👤 Player: ${playerName}\n🔢 Game ID: ${gameId}\n📱 Device: ${deviceModel}\n\nReady for the challenge! Wish me luck! 🏆⚡\n#eFootball #Tournament #OfficialContender`;
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const nameWords = playerName.trim().split(/\s+/).filter(Boolean);
  const longestWord = nameWords.reduce((max, word) => Math.max(max, word.length), 0);

  // Poster-style headline sizing: keep it huge, but fit long names inside the left column.
  const baseSize =
    longestWord > 12 ? 30 :
    longestWord > 10 ? 34 :
    longestWord > 8 ? 40 :
    longestWord > 6 ? 46 : 54;
  const lineCountFactor = nameWords.length >= 4 ? 0.68 : nameWords.length === 3 ? 0.82 : 1;
  const nameSize = Math.round(baseSize * lineCountFactor);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      {/* 4:5 Poster Card — white frame, navy grunge poster */}
      <div
        ref={cardRef}
        className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl select-none bg-white p-2"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        <div
          className="relative w-full h-full overflow-hidden rounded-xl"
          style={{
            background: `radial-gradient(circle at 30% 16%, #003a7a 0%, ${NAVY} 40%, #00132c 100%)`,
          }}
        >
          {/* Grain / grunge */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none mix-blend-overlay">
            <filter id="poster-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#poster-grain)" />
          </svg>

          {/* Gold brush shapes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 500"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="poster-gold" x1="0" y1="0" x2="0.55" y2="1">
                <stop offset="0%" stopColor="#e0b76f" />
                <stop offset="45%" stopColor={GOLD} />
                <stop offset="100%" stopColor="#9f6f2c" />
              </linearGradient>
            </defs>

            {/* Main vertical brush panel behind the player */}
            <path
              d="M228 52 L400 56 L400 306 L360 300 L330 310 L300 301 L272 309 L246 300 L228 296 L236 266 L222 238 L233 208 L221 178 L231 148 L221 118 L229 90 Z"
              fill="url(#poster-gold)"
            />

            {/* Waist brush accent */}
            <path
              d="M204 236 L240 230 L266 240 L260 254 L232 262 L208 256 Z"
              fill="url(#poster-gold)"
              opacity="0.95"
            />

            {/* Bottom-right brush swoosh */}
            <path
              d="M248 396 C300 382 352 406 400 394 L400 436 C352 448 298 424 246 442 L234 418 Z"
              fill="url(#poster-gold)"
              opacity="0.98"
            />
            <path d="M300 450 L400 444 L398 454 L298 460 Z" fill="url(#poster-gold)" opacity="0.9" />
            <path d="M262 412 C 300 404 330 416 352 410 L 354 418 C 330 424 300 414 266 422 Z" fill="#e0b76f" opacity="0.7" />

            {/* Small grunge specks */}
            <path d="M318 0 L400 0 L400 42 L384 36 L372 46 L360 32 L346 40 L334 26 Z" fill="#ffffff" opacity="0.07" />
            <path d="M0 470 L22 462 L34 474 L18 484 L0 480 Z" fill="#ffffff" opacity="0.05" />
            <circle cx="356" cy="26" r="2.3" fill="#ffffff" opacity="0.55" />
            <circle cx="372" cy="38" r="1.6" fill="#ffffff" opacity="0.45" />
            <circle cx="340" cy="16" r="1.4" fill={GOLD} opacity="0.7" />
            <circle cx="388" cy="24" r="1.2" fill={GOLD} opacity="0.6" />
            <circle cx="350" cy="48" r="1" fill="#ffffff" opacity="0.4" />
            <circle cx="380" cy="54" r="1.8" fill={GOLD} opacity="0.5" />
          </svg>

          {/* Player cutout — full colour, large but never cropped */}
          <div className="absolute right-[-6%] bottom-0 w-[80%] aspect-[4/5] z-20">
            {playerImageUrl ? (
              <img
                src={playerImageUrl}
                alt={playerName}
                className="w-full h-full object-contain object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)]"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/40 p-4 text-center">
                <Shield className="w-16 h-16 mb-2 text-[#c89850]/60" />
                <span className="text-[10px] font-sans tracking-widest uppercase">No Photo</span>
              </div>
            )}

            {/* Fade the feet into the navy base */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#00142f] via-[#00142f]/60 to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className="relative z-30 flex h-full flex-col px-5 pt-6 pb-5">
            {/* Club wordmark — gold plaque, top centre */}
            <div className="flex w-full justify-center">
              <div
                className="px-5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                style={{
                  backgroundColor: GOLD,
                  clipPath: 'polygon(3% 6%, 100% 0%, 97% 94%, 0% 100%)',
                }}
              >
                <span
                  className="block text-[14px] font-black uppercase leading-none tracking-[0.11em]"
                  style={{ color: '#00142f' }}
                >
                  The Enigmatic Elite
                </span>
              </div>
            </div>

            {/* Tournament name — gold brush banner */}
            <div className="self-start max-w-[62%] mt-8">
              <div
                className="inline-block px-3 py-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                style={{
                  backgroundColor: GOLD,
                  transform: 'rotate(-1.5deg)',
                  clipPath:
                    'polygon(1% 14%, 99% 0%, 98% 86%, 2% 100%, 0% 52%)',
                }}
              >
                <span
                  className="block text-[11px] font-bold uppercase leading-tight tracking-[0.12em]"
                  style={{ color: '#00142f' }}
                >
                  {tournamentTitle}
                </span>
              </div>
            </div>

            {/* Player name — giant poster headline, 20px below tournament name */}
            <div className="mt-5">
              <h2
                className="max-w-[68%] uppercase text-white"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 900,
                  fontSize: `${nameSize}px`,
                  lineHeight: 0.82,
                  letterSpacing: '-0.015em',
                  textShadow: '0 6px 18px rgba(0,0,0,0.35)',
                }}
              >
                {nameWords.map((word, index) => (
                  <span key={`${word}-${index}`} className="block break-words">
                    {word}
                  </span>
                ))}
              </h2>
            </div>

            {/* Spacer keeps the stats pinned to the bottom */}
            <div className="flex-1" />

            {/* Bottom-left: contender label + Game ID / Device */}
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-7 rounded-full" style={{ backgroundColor: GOLD }} />
                <span className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Official Contender
                </span>
              </div>

              <div className="flex max-w-[64%] items-baseline gap-1.5">
                <span
                  className="flex-shrink-0 text-[7px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: GOLD }}
                >
                  Game ID
                </span>
                <span className="min-w-0 break-all font-mono text-[11px] font-semibold leading-tight text-white">
                  {gameId || '—'}
                </span>
              </div>

              <div className="flex max-w-[64%] items-baseline gap-1.5">
                <span
                  className="flex-shrink-0 text-[7px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: GOLD }}
                >
                  Device
                </span>
                <span className="min-w-0 truncate text-[11px] font-semibold leading-tight text-white">
                  {deviceModel || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Actions Below Card ─── */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c89850] hover:bg-[#b58641] text-[#00173d] font-bold text-sm shadow-lg transition active:scale-[0.98] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download Card (HD)'}
        </button>

        <button
          onClick={handleCopyCaption}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/10 shadow transition active:scale-[0.98]"
          title="Copy Facebook post caption"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-white/80" />
              <span>Copy Caption</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
