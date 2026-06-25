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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'linear-gradient(135deg,#ff3131,#ff6b35)',
      color: '#fff', fontSize: '10px', fontWeight: 700,
      letterSpacing: '0.08em', padding: '3px 10px',
      borderRadius: '999px', textTransform: 'uppercase',
      boxShadow: '0 2px 12px rgba(255,49,49,0.55)',
    }}>
      🔥 HOT
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE A — Navy/Blue  (used by: League, General)
//           Full-bleed image · red diagonal ribbon · navy description strip
// ═══════════════════════════════════════════════════════════════════════════════
function NavyCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-league"
      style={{
        borderRadius: '16px', overflow: 'hidden', position: 'relative',
        cursor: 'pointer', background: '#0a1628',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Full-bleed image */}
      <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img} alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Dark navy gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,22,40,0.15) 0%, rgba(10,22,40,0.55) 55%, rgba(10,22,40,0.96) 100%)',
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
        {article.hot && <span style={{ position: 'absolute', top: 12, right: 12 }}><HotBadge /></span>}

        {/* Bottom ribbon + title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#c8102e 60%,#9b0020)',
              padding: '6px 20px 6px 14px',
              clipPath: 'polygon(0 0,100% 0,95% 100%,0 100%)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontWeight: 800,
                fontSize: '22px', color: '#fff', textTransform: 'uppercase',
                letterSpacing: '0.04em', lineHeight: 1, display: 'block',
              }}>
                {article.category}
              </span>
            </div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', padding: '4px 14px', backdropFilter: 'blur(4px)' }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                fontSize: '14px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>
                News
              </span>
            </div>
          </div>
          <p style={{
            fontStyle: 'italic', fontWeight: 600, color: '#e2e8f0',
            fontSize: '13px', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0,
          }}>
            {article.title}
          </p>
        </div>
      </div>

      {/* Description strip */}
      <div style={{ background: '#0d1e36', padding: '12px 16px 14px' }}>
        <p style={{
          fontSize: '12px', color: '#93c5fd', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 8px',
        }}>
          {article.content || 'No content provided.'}
        </p>
        <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600 }}>
          By {article.author}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE B — Emerald/Green  (used by: Transfer, Player)
//           Full-bleed image · emerald ribbon · dark green description strip
// ═══════════════════════════════════════════════════════════════════════════════
function EmeraldCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-transfer"
      style={{
        borderRadius: '16px', overflow: 'hidden', position: 'relative',
        cursor: 'pointer', background: '#071a0f',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Full-bleed image */}
      <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img} alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Deep green gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,26,15,0.1) 0%, rgba(7,26,15,0.5) 55%, rgba(7,26,15,0.96) 100%)',
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
        {article.hot && <span style={{ position: 'absolute', top: 12, right: 12 }}><HotBadge /></span>}

        {/* Bottom ribbon + title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#059669 60%,#047857)',
              padding: '6px 20px 6px 14px',
              clipPath: 'polygon(0 0,100% 0,95% 100%,0 100%)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontWeight: 800,
                fontSize: '22px', color: '#fff', textTransform: 'uppercase',
                letterSpacing: '0.04em', lineHeight: 1, display: 'block',
              }}>
                {article.category}
              </span>
            </div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '4px 14px', backdropFilter: 'blur(4px)' }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                fontSize: '14px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>
                News
              </span>
            </div>
          </div>
          <p style={{
            fontStyle: 'italic', fontWeight: 600, color: '#d1fae5',
            fontSize: '13px', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0,
          }}>
            {article.title}
          </p>
        </div>
      </div>

      {/* Description strip */}
      <div style={{ background: '#081f12', padding: '12px 16px 14px' }}>
        <p style={{
          fontSize: '12px', color: '#6ee7b7', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 8px',
        }}>
          {article.content || 'No content provided.'}
        </p>
        <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 600 }}>
          By {article.author}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE C — Crimson/Red  (used by: Milestone)
//           Full-bleed image · crimson ribbon · dark red description strip
// ═══════════════════════════════════════════════════════════════════════════════
function CrimsonCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-injury"
      style={{
        borderRadius: '16px', overflow: 'hidden', position: 'relative',
        cursor: 'pointer', background: '#1a0005',
        boxShadow: '0 8px 32px rgba(140,0,20,0.4)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Full-bleed image */}
      <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img} alt={article.title}
          className="news-card-img"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* Deep crimson gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(26,0,5,0.3) 50%, rgba(26,0,5,0.95) 100%)',
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
        {article.hot && <span style={{ position: 'absolute', top: 12, right: 12 }}><HotBadge /></span>}

        {/* Bottom ribbon + title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
          <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg,#991b1b 60%,#7f1d1d)',
              padding: '6px 20px 6px 14px',
              clipPath: 'polygon(0 0,100% 0,95% 100%,0 100%)',
            }}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontWeight: 800,
                fontSize: '22px', color: '#fff', textTransform: 'uppercase',
                letterSpacing: '0.04em', lineHeight: 1, display: 'block',
              }}>
                {article.category}
              </span>
            </div>
            <div style={{
              display: 'inline-flex', background: 'rgba(255,255,255,0.08)', padding: '4px 14px',
              backdropFilter: 'blur(4px)', alignItems: 'center', gap: '6px'
            }}>
              <span style={{ fontSize: '10px' }}>🏆</span>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                fontSize: '13px', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Update
              </span>
            </div>
          </div>
          <p style={{
            fontStyle: 'italic', fontWeight: 600, color: '#fecaca',
            fontSize: '13px', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0,
          }}>
            {article.title}
          </p>
        </div>
      </div>

      {/* Description strip */}
      <div style={{ background: '#1f0008', padding: '12px 16px 14px' }}>
        <p style={{
          fontSize: '12px', color: '#fca5a5', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 8px',
        }}>
          {article.content || 'No content provided.'}
        </p>
        <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600 }}>
          By {article.author}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// Category → Card style mapping:
//   Milestone → Crimson  (default auto category)
//   General   → Navy
//   Player    → Emerald
//   League    → Navy
//   Transfer  → Emerald
// ═══════════════════════════════════════════════════════════════════════════════
export function NewsCard({ article }: NewsCardProps) {
  switch (article.category) {
    case 'Milestone': return <CrimsonCard article={article} />;
    case 'Player':    return <EmeraldCard article={article} />;
    case 'Transfer':  return <EmeraldCard article={article} />;
    case 'League':    return <NavyCard    article={article} />;
    case 'General':   return <NavyCard    article={article} />;
    default:          return <CrimsonCard article={article} />;
  }
}
