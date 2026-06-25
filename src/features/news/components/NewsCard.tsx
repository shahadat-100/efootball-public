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
// STYLE 2 — "Player" → Torn paper / player spotlight card (dark red + white)
// ═══════════════════════════════════════════════════════════════════════════════
function PlayerCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-player"
      style={{
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        border: article.hot ? '2px solid #c8102e' : '2px solid #eee',
      }}
    >
      {/* Image section */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden', background: '#f0f0f0' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        {/* torn paper bottom mask */}
        <div style={{
          position: 'absolute', bottom: -1, left: 0, right: 0, height: '28px',
          background: '#fff',
          clipPath: 'polygon(0 60%,2% 20%,4% 70%,6% 30%,8% 65%,10% 15%,12% 55%,14% 25%,16% 60%,18% 10%,20% 50%,22% 80%,24% 40%,26% 70%,28% 20%,30% 55%,32% 30%,34% 65%,36% 15%,38% 50%,40% 80%,42% 35%,44% 65%,46% 25%,48% 55%,50% 10%,52% 45%,54% 80%,56% 30%,58% 60%,60% 20%,62% 55%,64% 25%,66% 65%,68% 10%,70% 50%,72% 80%,74% 40%,76% 70%,78% 20%,80% 55%,82% 30%,84% 60%,86% 15%,88% 50%,90% 75%,92% 35%,94% 65%,96% 25%,98% 55%,100% 20%,100% 100%,0 100%)',
        }} />
        {article.hot && (
          <span style={{ position: 'absolute', top: 10, right: 10 }}>
            <HotBadge />
          </span>
        )}
      </div>

      {/* Dark red title block */}
      <div style={{
        background: '#8b0000',
        padding: '10px 16px 12px',
        position: 'relative',
      }}>
        <span style={{
          display: 'inline-block',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#ffcdd2',
          marginBottom: '4px',
        }}>
          ● {article.category}
        </span>
        <h3
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: 1.15,
            color: '#fff',
            textTransform: 'uppercase',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}
        >
          {article.title}
        </h3>
        {article.author && (
          <p style={{
            fontSize: '11px', color: '#ff8a80',
            fontStyle: 'italic', fontWeight: 600, marginTop: '6px',
          }}>
            {article.author}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: '#fff',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #f0f0f0',
      }}>
        <span style={{ fontSize: '10px', color: '#888', fontWeight: 600, letterSpacing: '0.06em' }}>
          {formatDate(article.date)}
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 700, color: '#8b0000',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Read More →
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
// STYLE 4 — "Transfer" → Soccer magazine style: image top + blue/red info block
// ═══════════════════════════════════════════════════════════════════════════════
function TransferCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-transfer"
      style={{
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,50,0.7) 0%, transparent 55%)',
        }} />
        {article.hot && (
          <span style={{ position: 'absolute', top: 10, right: 10 }}>
            <HotBadge />
          </span>
        )}
      </div>

      {/* Blue-navy category banner */}
      <div style={{
        background: 'linear-gradient(135deg,#1a237e,#283593)',
        padding: '10px 16px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: '#c8102e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0,
        }}>
          🔄
        </span>
        <div>
          <p style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 800, fontSize: '16px',
            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em',
            lineHeight: 1, margin: 0,
          }}>
            {article.category}
          </p>
          <p style={{ fontSize: '9px', color: '#90caf9', fontWeight: 600, letterSpacing: '0.08em', margin: '2px 0 0' }}>
            {formatDate(article.date)}
          </p>
        </div>
      </div>

      {/* Title & content */}
      <div style={{ padding: '12px 16px' }}>
        <h3 style={{
          fontWeight: 700, fontSize: '14px', lineHeight: 1.3,
          color: '#1a237e', marginBottom: '6px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: '0 0 6px',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontSize: '12px', color: '#555', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {article.content || 'No content provided.'}
        </p>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid #e8eaf6',
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '10px', color: '#555', fontWeight: 600,
        }}>
          <span style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#1a237e,#c8102e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '8px', fontWeight: 700,
          }}>
            {article.author?.charAt(0) || 'A'}
          </span>
          {article.author}
        </span>
        <button style={{
          background: '#c8102e',
          color: '#fff', border: 'none',
          padding: '5px 14px', borderRadius: '999px',
          fontSize: '10px', fontWeight: 700,
          cursor: 'pointer', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Read More
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE 5 — "Injury" → Dark alert card with red warning accent + excerpt
// ═══════════════════════════════════════════════════════════════════════════════
function InjuryCard({ article }: NewsCardProps) {
  const img = article.image || DEFAULT_NEWS_IMAGE;
  return (
    <div
      className="group news-card-injury"
      style={{
        background: '#1a0a0a',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(200,16,46,0.2)',
        border: `1px solid ${article.hot ? '#c8102e' : '#2d1515'}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Image with dark red gradient */}
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={img}
          alt={article.title}
          className="news-card-img"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'saturate(0.7) brightness(0.75)',
            transition: 'transform 0.5s ease',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_NEWS_IMAGE; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, rgba(26,10,10,0.95) 100%)',
        }} />
        {/* Alert strip */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(90deg,#c8102e,#a00020)',
          padding: '4px 14px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ fontSize: '11px' }}>⚠️</span>
          <span style={{
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700, fontSize: '11px',
            color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Injury Update
          </span>
          {article.hot && (
            <span style={{ marginLeft: 'auto' }}>
              <HotBadge />
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700, fontSize: '16px',
          color: '#fff', textTransform: 'uppercase',
          lineHeight: 1.25, marginBottom: '8px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: '0 0 8px',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontSize: '12px', color: '#b0b0b0', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {article.content || 'No content provided.'}
        </p>

        <div style={{
          marginTop: '12px', paddingTop: '12px',
          borderTop: '1px solid #2d1515',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>
            {formatDate(article.date)}
          </span>
          <span style={{
            fontSize: '10px', color: '#ff6b6b', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            By {article.author}
          </span>
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
