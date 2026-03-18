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
    <div className="slide-up" style={{
      background: 'var(--bg-card)',
      border: `1px solid ${won ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Banner */}
      <div style={{
        background: won
          ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 20px 16px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{won ? '🎉' : '😔'}</div>
        <h2 style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: '2rem',
          letterSpacing: '0.12em',
          color: won ? 'var(--correct)' : 'var(--text)',
          marginBottom: 4,
        }}>
          {won ? 'Bravo !' : 'Raté...'}
        </h2>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.875rem' }}>
          {won
            ? `Trouvé en ${state.attempts} essai${state.attempts > 1 ? 's' : ''} !`
            : `Le film était :`}
        </p>
      </div>

      {/* Movie info */}
      <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {targetMovie.posterPath && (
          <img
            src={`${IMAGE_BASE}${targetMovie.posterPath}`}
            alt={targetMovie.title}
            style={{ width: 90, borderRadius: 8, flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          />
        )}
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 4 }}>
            {targetMovie.title}
          </h3>
          {targetMovie.title !== targetMovie.originalTitle && (
            <p style={{ color: 'var(--text-soft)', fontSize: '0.78rem', marginBottom: 4 }}>{targetMovie.originalTitle}</p>
          )}
          <p style={{ color: 'var(--text-soft)', fontSize: '0.78rem', marginBottom: 8 }}>
            {targetMovie.year}
            {targetMovie.runtime > 0 && ` · ${targetMovie.runtime} min`}
            {targetMovie.director && ` · ${targetMovie.director.name}`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {targetMovie.genres.map((g) => (
              <span key={g.id} style={{
                padding: '2px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
                background: 'var(--gold-dim)', color: 'var(--gold)',
              }}>
                {g.name}
              </span>
            ))}
          </div>
          {targetMovie.overview && (
            <p style={{ color: 'var(--text-soft)', fontSize: '0.75rem', lineHeight: 1.5 }}>
              {targetMovie.overview}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          { label: 'Essais', value: `${state.attempts}/${state.maxAttempts}` },
          { label: 'Indices', value: String(state.hints.length) },
          { label: 'Résultat', value: won ? 'Victoire' : 'Défaite', gold: won },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '12px 8px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: 4 }}>
              {s.label}
            </p>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: s.gold ? 'var(--gold)' : 'var(--text)' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}
