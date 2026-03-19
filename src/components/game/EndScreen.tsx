import { useMemo } from 'react'
import type { Movie } from '#/categories/movie/types'
import type { GameState } from '#/core/types'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

interface EndScreenProps {
  state: GameState
  targetMovie: Movie
}

export function EndScreen({ state, targetMovie }: EndScreenProps) {
  const won = state.outcome === 'won'

  return (
    <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Banner: BRAVO or RATÉ with cinema frame */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 16,
        padding: '36px 24px 28px',
        textAlign: 'center',
        background: won
          ? 'linear-gradient(180deg, rgba(212,168,67,0.1) 0%, rgba(212,168,67,0.02) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
        border: `1px solid ${won ? 'var(--gold-border)' : 'var(--border-strong)'}`,
      }}>
        {/* Confetti for win */}
        {won && <Confetti />}

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Art deco frame around title */}
          <div style={{
            display: 'inline-block',
            position: 'relative',
            padding: '12px 40px 10px',
            border: '2px solid var(--gold)',
            boxShadow: '0 0 30px var(--gold-glow)',
            marginBottom: 8,
          }}>
            <div style={{
              position: 'absolute',
              inset: 4,
              border: '1px solid var(--gold-border)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              fontFamily: won ? '"Limelight", cursive' : '"Bebas Neue", Impact, sans-serif',
              fontSize: won ? '3rem' : '2.4rem',
              letterSpacing: won ? '0.08em' : '0.15em',
              color: 'var(--gold-light)',
              lineHeight: 1,
              textShadow: '0 0 20px var(--gold-glow), 0 0 40px rgba(212,168,67,0.1)',
            }}>
              {won ? 'BRAVO !' : 'RATÉ...'}
            </h2>
          </div>

          {!won && (
            <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginTop: 8 }}>
              Le film était :
            </p>
          )}
        </div>
      </div>

      {/* Movie info card */}
      <div className="gold-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {targetMovie.posterPath && (
            <img
              src={`${IMAGE_BASE}${targetMovie.posterPath}`}
              alt={targetMovie.title}
              style={{
                width: 110,
                borderRadius: 8,
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                border: '1px solid var(--gold-border)',
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--text)',
              marginBottom: 4,
            }}>
              {targetMovie.title}
            </h3>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.8rem', marginBottom: 8 }}>
              {targetMovie.year}
              {targetMovie.runtime > 0 && ` · ${targetMovie.runtime} min`}
              {targetMovie.director && ` · ${targetMovie.director.name}`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
              {targetMovie.genres.map((g) => (
                <span key={g.id} style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                  background: 'var(--gold-dim)', color: 'var(--gold)',
                  border: '1px solid var(--gold-border)',
                }}>
                  {g.name}
                </span>
              ))}
            </div>
            {targetMovie.overview && (
              <p style={{ color: 'var(--text-soft)', fontSize: '0.78rem', lineHeight: 1.6 }}>
                {targetMovie.overview}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--gold-border)',
        }}>
          {[
            { label: 'Essais', value: `${state.attempts}/${state.maxAttempts}` },
            { label: 'Indices', value: String(state.hints.length) },
            { label: 'Résultat', value: won ? 'Victoire' : 'Défaite', gold: won },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '14px 8px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--gold-border)' : 'none',
            }}>
              <p style={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: 4,
              }}>
                {s.label}
              </p>
              <p style={{
                fontFamily: s.gold ? '"Playfair Display", serif' : undefined,
                fontWeight: 700,
                fontStyle: s.gold ? 'italic' : undefined,
                fontSize: '1.05rem',
                color: s.gold ? 'var(--gold-light)' : 'var(--text)',
              }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#d4a843', '#e8c066', '#4ade80', '#fb923c', '#60a5fa', '#f472b6', '#fbbf24']
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[i % colors.length],
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      rotation: Math.random() * 360,
      width: 4 + Math.random() * 6,
      height: 8 + Math.random() * 10,
    }))
  }, [])

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: 2,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
