import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Copy, Check, Shield, Sparkles, X } from 'lucide-react';
import { dataUrlToBlob, isInAppBrowser, isMobileDevice } from '@/shared/lib/downloadHelper';

interface TournamentPlayerCardProps {
  playerName: string;
  playerImageUrl?: string | null;
  gameId: string;
  deviceModel: string;
  tournamentTitle?: string;
  seasonName?: string;
  showActions?: boolean;
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
  showActions = true,
  onDownloaded
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveModalImage, setSaveModalImage] = useState<string | null>(null);

  // Handle Download Image (High Res 4:5) — handles mobile, in-app webviews (FB/IG), and desktop
  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.98,
        pixelRatio: 3, // Ultra-crisp 3x resolution for Facebook
      });

      const cleanName = playerName.trim().toLowerCase().replace(/\s+/g, '_') || 'player';
      const filename = `${cleanName}_card.png`;
      const blob = dataUrlToBlob(dataUrl);

      const inApp = isInAppBrowser();
      const mobile = isMobileDevice();

      // 1. Try Web Share API (native sheet on iOS / Android with "Save Image")
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${playerName} - Tournament Card`,
              text: `⚽ Officially registered for ${tournamentTitle}! 🔥`,
            });
            if (onDownloaded) onDownloaded(dataUrl);
            return;
          }
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') return;
          console.warn('Web Share failed, falling back:', shareErr);
        }
      }

      // 2. If inside Facebook / Instagram in-app browser, standard <a download> is blocked
      // and produces "Page not found or maybe deleted". Open the save modal instead!
      if (inApp) {
        setSaveModalImage(dataUrl);
        if (onDownloaded) onDownloaded(dataUrl);
        return;
      }

      // 3. Standard Download via Blob URL (Clean & safe for Safari, Chrome, Edge)
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 3000);

      // On mobile devices, also pop up the save modal as a fallback so user can long-press
      if (mobile) {
        setSaveModalImage(dataUrl);
      }

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
      {/* 4:5 Poster Card — white frame preview, navy grunge poster */}
      <div
        ref={cardRef}
        className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl select-none bg-white p-2"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        <div
          ref={posterRef}
          className="relative w-full h-full overflow-hidden"
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

          {/* Gold backdrop behind the player — slightly cut rectangle */}
          <div
            className="absolute right-[1%] top-[15%] bottom-[9%] w-[70%] z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(160deg, #e0b76f 0%, #c89850 46%, #9f6f2c 100%)',
              clipPath: 'polygon(4% 2%, 100% 0%, 97% 97%, 0% 100%)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
            }}
          />

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
            {/* Club wordmark — top centre */}
            <div className="w-full text-center">
              <span className="text-[15px] font-black uppercase tracking-[0.2em] text-white">
                The Enigmatic Elite
              </span>
              <div className="mx-auto mt-1.5 h-[2px] w-16" style={{ backgroundColor: GOLD }} />
            </div>

            {/* Tournament name — gold brush banner */}
            <div className="self-start max-w-[62%] mt-5">
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
      {showActions && (
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#c89850] hover:bg-[#b58641] text-[#00173d] font-bold text-sm shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {downloading ? (
              <span>Generating...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Card (HD)</span>
              </>
            )}
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
      )}

      {/* ─── In-App / Mobile Save Modal (Resolves "Page Not Found / Deleted" issue) ─── */}
      {saveModalImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-sm bg-[#09152b] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center my-6">
            <button
              onClick={() => setSaveModalImage(null)}
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-full bg-[#c89850]/20 text-[#c89850] border border-[#c89850]/30 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-black text-white tracking-wide mb-1">
              Save Your Official Card
            </h3>
            
            <div className="p-3 my-3 rounded-xl bg-[#c89850]/15 border border-[#c89850]/30 text-left text-xs text-white/90">
              <p className="font-bold text-[#c89850] mb-0.5 flex items-center gap-1.5">
                <span>📱 How to save to your phone:</span>
              </p>
              <p className="text-[11px] text-white/80 leading-relaxed">
                <strong>Tap & hold (long-press)</strong> the image below and select <strong>"Save Image"</strong> or <strong>"Download Image"</strong> to save to your Photos!
              </p>
            </div>

            {/* High-res Image preview that allows long-press native saving */}
            <div className="w-full max-w-[270px] rounded-xl overflow-hidden shadow-2xl border border-white/20 mb-4 bg-black">
              <img
                src={saveModalImage}
                alt={playerName}
                className="w-full h-auto object-contain select-all cursor-pointer pointer-events-auto"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleCopyCaption}
                className="w-full py-2.5 px-4 rounded-xl bg-[#c89850] text-[#00173d] font-bold text-xs flex items-center justify-center gap-2 shadow hover:bg-[#b58641] transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Caption Copied!' : 'Copy Facebook Caption'}</span>
              </button>

              <button
                onClick={() => setSaveModalImage(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
