import type { NewsArticle } from '../types';

const DEFAULT_NEWS_IMAGE = '/images/hero-banner.jpg';

interface NewsCardProps {
  article: NewsArticle;
}

// ─── Shared helper ────────────────────────────────────────────────────────────
function formatDate(raw: string) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
}

// ─── HOT badge ────────────────────────────────────────────────────────────────
function HotBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'linear-gradient(135deg,#ff3131,#ff6b35)',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        padding: '3px 10px',
        borderRadius: '999px',
        textTransform: 'uppercase',
        boxShadow: '0 2px 12px rgba(255,49,49,0.55)',
      }}
    >
      🔥 HOT
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 1 — "General" → Dark stadium card with neon-yellow title panel
// ═══════════════════════════════════════════════════════════════════════════════
function GeneralCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-general"
      style={{
        background: '#0d0d0d',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Category tag top-left */}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '6px',
        }}>
          {article.category}
        </span>
        {article.hot && (
          <span style={{ position: 'absolute', top: 12, right: 12 }}>
            <HotBadge />
          </span>
        )}
        {/* Diagonal yellow stripe accent - bottom right */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '48px', height: '100%',
          background: 'repeating-linear-gradient(45deg,#e8ff00 0,#e8ff00 6px,transparent 6px,transparent 14px)',
          opacity: 0.55,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Yellow title block */}
      <div style={{
        background: '#e8ff00',
        padding: '14px 16px 10px',
        clipPath: 'polygon(0 8px,100% 0,100% 100%,0 100%)',
        marginTop: '-2px',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#111', textTransform: 'uppercase', marginBottom: '6px' }}>
          {article.category} News
        </p>
        <h3
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            lineHeight: 1.2,
            color: '#111',
            textTransform: 'uppercase',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}
        >
          {article.title}
        </h3>
      </div>

      {/* Footer */}
      <div style={{
        background: '#111',
        padding: '10px 16px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '10px', color: '#bbb', fontWeight: 600, letterSpacing: '0.08em' }}>
          {formatDate(article.date)}
        </span>
        <span style={{ fontSize: '10px', color: '#e8ff00', fontWeight: 600 }}>
          By {article.author}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 2 — "Player" → General-style dark card but with gold/amber accent panel
// ═══════════════════════════════════════════════════════════════════════════════
function PlayerCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-player"
      style={{
        background: '#0d0d0d',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Category tag top-left */}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          color: '#fbbf24', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '6px',
          border: '1px solid rgba(251,191,36,0.3)',
        }}>
          {article.category}
        </span>
        {article.hot && (
          <span style={{ position: 'absolute', top: 12, right: 12 }}>
            <HotBadge />
          </span>
        )}
        {/* Diagonal gold stripe accent */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '48px', height: '100%',
          background: 'repeating-linear-gradient(45deg,#fbbf24 0,#fbbf24 6px,transparent 6px,transparent 14px)',
          opacity: 0.45,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Gold title block */}
      <div style={{
        background: 'linear-gradient(135deg,#b8860b,#fbbf24)',
        padding: '14px 16px 10px',
        clipPath: 'polygon(0 8px,100% 0,100% 100%,0 100%)',
        marginTop: '-2px',
      }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#422006', textTransform: 'uppercase', marginBottom: '6px' }}>
          {article.category} Spotlight
        </p>
        <h3
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            lineHeight: 1.2,
            color: '#111',
            textTransform: 'uppercase',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}
        >
          {article.title}
        </h3>
      </div>

      {/* Footer */}
      <div style={{
        background: '#111',
        padding: '10px 16px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '10px', color: '#bbb', fontWeight: 600, letterSpacing: '0.08em' }}>
          {formatDate(article.date)}
        </span>
        <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>
          By {article.author}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 3 — "League" → Action photo banner with diagonal red ribbon title
// ═══════════════════════════════════════════════════════════════════════════════
function LeagueCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-league"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: '#0a1628',
      }}
    >
      {/* Full-height image */}
      <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Dark navy gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 50%, rgba(10,22,40,0.92) 100%)',
        }} />

        {/* Date badge top-left */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,30,80,0.8)', backdropFilter: 'blur(8px)',
          color: '#93c5fd', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '6px',
          border: '1px solid rgba(147,197,253,0.2)',
        }}>
          {formatDate(article.date)}
        </div>

        {article.hot && (
          <span style={{ position: 'absolute', top: 12, right: 12 }}>
            <HotBadge />
          </span>
        )}

        {/* Bottom content overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          {/* Red diagonal ribbon title */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#c8102e 60%,#9b0020)',
              padding: '6px 20px 6px 14px',
              clipPath: 'polygon(0 0,100% 0,95% 100%,0 100%)',
              marginBottom: '0',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1,
                display: 'block',
              }}>
                {article.category}
              </span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '4px 14px',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}>
                News
              </span>
            </div>
          </div>

          <p style={{
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#e2e8f0',
            fontSize: '13px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}>
            {article.title}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 4 — "Transfer" → League-style full-bleed with emerald/green ribbon
// ═══════════════════════════════════════════════════════════════════════════════
function TransferCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-transfer"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: '#071a0f',
      }}
    >
      {/* Full-height image */}
      <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Deep green gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,26,15,0.25) 0%, rgba(7,26,15,0.55) 50%, rgba(7,26,15,0.93) 100%)',
        }} />

        {/* Date badge top-left */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(5,40,20,0.85)', backdropFilter: 'blur(8px)',
          color: '#6ee7b7', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '6px',
          border: '1px solid rgba(110,231,183,0.25)',
        }}>
          {formatDate(article.date)}
        </div>

        {article.hot && (
          <span style={{ position: 'absolute', top: 12, right: 12 }}>
            <HotBadge />
          </span>
        )}

        {/* Bottom content overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          {/* Emerald diagonal ribbon */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#059669 60%,#047857)',
              padding: '6px 20px 6px 14px',
              clipPath: 'polygon(0 0,100% 0,95% 100%,0 100%)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1,
                display: 'block',
              }}>
                {article.category}
              </span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '4px 14px',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}>
                News
              </span>
            </div>
          </div>

          <p style={{
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#d1fae5',
            fontSize: '13px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}>
            {article.title}
          </p>

          {/* Author row */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: '#6ee7b7', fontWeight: 600 }}>
              By {article.author}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 5 — "Injury" → League-style full-bleed with deep crimson atmosphere
// ═══════════════════════════════════════════════════════════════════════════════
function InjuryCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-injury"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(140,0,20,0.4)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: '#1a0005',
      }}
    >
      {/* Full-height image */}
      <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'saturate(0.6)',
            transition: 'transform 0.5s ease',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Deep crimson gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(26,0,5,0.2) 0%, rgba(26,0,5,0.5) 45%, rgba(26,0,5,0.95) 100%)',
        }} />

        {/* Date badge top-left */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(60,0,10,0.85)', backdropFilter: 'blur(8px)',
          color: '#fca5a5', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '4px 10px', borderRadius: '6px',
          border: '1px solid rgba(252,165,165,0.2)',
        }}>
          {formatDate(article.date)}
        </div>

        {article.hot && (
          <span style={{ position: 'absolute', top: 12, right: 12 }}>
            <HotBadge />
          </span>
        )}

        {/* Bottom content overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          {/* Crimson diagonal ribbon */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#991b1b 60%,#7f1d1d)',
              padding: '6px 20px 6px 14px',
              clipPath: 'polygon(0 0,100% 0,95% 100%,0 100%)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 800,
                fontSize: '22px',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1,
                display: 'block',
              }}>
                {article.category}
              </span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '4px 14px',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ fontSize: '10px' }}>⚠️</span>
              <span style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                color: '#fca5a5',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Update
              </span>
            </div>
          </div>

          <p style={{
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#fecaca',
            fontSize: '13px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}>
            {article.title}
          </p>

          {/* Author row */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: '#fca5a5', fontWeight: 600 }}>
              By {article.author}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — picks the right card based on category
// ═══════════════════════════════════════════════════════════════════════════════
export function NewsCard({ article }: NewsCardProps) {
  switch (article.category) {
    case 'Player':    return <PlayerCard   article={article} />;
    case 'League':    return <LeagueCard   article={article} />;
    case 'Transfer':  return <TransferCard article={article} />;
    case 'Injury':    return <InjuryCard   article={article} />;
    default:          return <GeneralCard  article={article} />;
  }
}
