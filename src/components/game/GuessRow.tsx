import { useRef, useState, useEffect } from 'react'
import type { ActorComparison, CountryComparison, DirectorComparison, GenreComparison, GuessResult, RatingComparison, YearComparison } from '#/core/types'
import { Calendar, Globe, Star, Users, Clapperboard } from 'lucide-react'
import { PersonCard } from './PersonCard'
import { CountryBadge } from './CountryBadge'

interface GuessRowProps {
  result: GuessResult
  index: number
}

export function GuessRow({ result, index }: GuessRowProps) {
  const year     = result.comparisons.find((c) => c.attribute === 'year')     as YearComparison | undefined
  const country  = result.comparisons.find((c) => c.attribute === 'country')  as CountryComparison | undefined
  const rating   = result.comparisons.find((c) => c.attribute === 'rating')   as RatingComparison | undefined
  const director = result.comparisons.find((c) => c.attribute === 'director') as DirectorComparison | undefined
  const actors   = result.comparisons.find((c) => c.attribute === 'actors')   as ActorComparison | undefined
  const genres   = result.comparisons.find((c) => c.attribute === 'genres')   as GenreComparison | undefined

  const matchedActors = actors?.actors.filter((a) => a.match).length ?? 0
  const totalActors   = actors?.actors.length ?? 0

  return (
    <div
      className="gold-card slide-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Title bar */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid var(--gold-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(212,168,67,0.06), transparent)',
      }}>
        <span style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          fontStyle: 'normal',
          color: 'var(--text)',
          fontSize: '1.1rem',
        }}>
          {result.guessedMovieTitle}
        </span>
        <span style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.05em',
        }}>
          #{index + 1}
        </span>
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Chips row : Année · Pays · Note · Genres */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {year && (
            <Chip icon={<Calendar size={11} />} label="Année" status={year.status}>
              {year.value}{year.direction !== 'exact' && <Arrow dir={year.direction} />}
            </Chip>
          )}

          {country && (
            <Chip icon={<Globe size={11} />} label="Pays" status={country.hasMatch ? 'correct' : 'incorrect'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                {country.values.map((c) => (
                  <span key={c.code} style={{ opacity: c.match ? 1 : 0.35 }}>
                    <CountryBadge code={c.code} highlight={c.match} />
                  </span>
                ))}
              </div>
            </Chip>
          )}

          {rating && (
            <Chip icon={<Star size={11} />} label="Note" status={rating.status}>
              {rating.value}{rating.direction !== 'exact' && <Arrow dir={rating.direction} />}
            </Chip>
          )}

          {/* Genres inline */}
          {genres && (
            <Chip icon={<Clapperboard size={11} />} label="Genres" status={genres.matchedCount > 0 ? 'correct' : 'incorrect'}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {genres.genres.map((g) => (
                  <Pill key={g.id} status={g.match ? 'correct' : 'neutral'}>{g.name}</Pill>
                ))}
              </div>
            </Chip>
          )}
        </div>

        {/* Director */}
        {director?.director && (
          <Section
            icon={<Clapperboard size={11} />}
            label="Réalisateur"
            status={director.status === 'correct' ? 'correct' : 'incorrect'}
          >
            <div style={{ opacity: director.status === 'correct' ? 1 : 0.28, transition: 'opacity 0.2s' }}>
              <PersonCard
                name={director.director.name}
                profilePath={director.director.profilePath}
                status={director.status === 'correct' ? 'correct' : 'neutral'}
                size="sm"
              />
            </div>
          </Section>
        )}

        {/* Actors */}
        {actors && totalActors > 0 && (
          <CastSection actors={actors} matchedActors={matchedActors} totalActors={totalActors} />
        )}
      </div>
    </div>
  )
}

const CAST_LIMIT = 7

function CastSection({ actors, matchedActors, totalActors }: { actors: ActorComparison; matchedActors: number; totalActors: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = totalActors > CAST_LIMIT
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (innerRef.current) {
      setHeight(innerRef.current.scrollHeight)
    }
  }, [expanded])

  return (
    <Section
      icon={<Users size={11} />}
      label="Casting"
      count={`${matchedActors}/${totalActors}`}
      status={matchedActors > 0 ? 'correct' : undefined}
    >
      <div style={{
        overflow: 'visible',
        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div ref={innerRef}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
            {actors.actors.map((a, i) => {
              const hidden = !expanded && i >= CAST_LIMIT
              return (
                <div key={a.id} style={{
                  opacity: hidden ? 0 : (a.match ? 1 : 0.28),
                  transform: hidden ? 'scale(0.9)' : 'scale(1)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  transitionDelay: !hidden && i >= CAST_LIMIT ? `${(i - CAST_LIMIT) * 40}ms` : '0ms',
                  display: hidden ? 'none' : undefined,
                }}>
                  <PersonCard
                    name={a.name}
                    profilePath={a.profilePath}
                    subtitle={a.character}
                    status={a.match ? 'correct' : 'neutral'}
                    size="sm"
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 8,
            background: 'none',
            border: '1px solid var(--gold-border)',
            borderRadius: 99,
            padding: '5px 16px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--gold)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {expanded ? 'Voir moins' : `Voir les ${totalActors - CAST_LIMIT} autres`}
        </button>
      )}
    </Section>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Section({ icon, label, count, status, children }: {
  icon?: React.ReactNode
  label: string
  count?: string
  status?: 'correct' | 'incorrect'
  children: React.ReactNode
}) {
  const countColor = status === 'correct' ? 'var(--correct)' : status === 'incorrect' ? '#f87171' : 'var(--text-soft)'
  return (
    <div style={{ borderTop: '1px solid rgba(212,168,67,0.15)', paddingTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        {icon && <span style={{ color: 'var(--gold)', display: 'flex', opacity: 0.7 }}>{icon}</span>}
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-soft)', textTransform: 'uppercase' }}>
          {label}
        </p>
        {count && (
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: countColor, marginLeft: 2 }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Chip({ icon, label, status, children }: {
  icon?: React.ReactNode
  label: string
  status: 'correct' | 'close' | 'incorrect' | 'neutral'
  children: React.ReactNode
}) {
  const colors = {
    correct:   { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.3)',  text: 'var(--correct)' },
    close:     { bg: 'rgba(251,146,60,0.08)',   border: 'rgba(251,146,60,0.3)',  text: 'var(--close)' },
    incorrect: { bg: 'rgba(255,255,255,0.03)',  border: 'var(--border-strong)',   text: 'var(--text-soft)' },
    neutral:   { bg: 'rgba(255,255,255,0.03)',  border: 'var(--border-strong)',   text: 'var(--text)' },
  }[status]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
      padding: '8px 14px', borderRadius: 10,
      background: colors.bg, border: `1px solid ${colors.border}`,
      minWidth: 64,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon && <span style={{ color: 'var(--gold)', display: 'flex', opacity: 0.7 }}>{icon}</span>}
        <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-soft)', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem', fontWeight: 700, color: colors.text }}>
        {children}
      </div>
    </div>
  )
}

function Pill({ status, children }: { status: 'correct' | 'close' | 'neutral'; children: React.ReactNode }) {
  const colors = {
    correct: { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', text: 'var(--correct)' },
    close:   { bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)', text: 'var(--close)' },
    neutral: { bg: 'rgba(255,255,255,0.04)', border: 'var(--border-strong)', text: 'var(--text-soft)' },
  }[status]

  return (
    <span style={{
      padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
      background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
    }}>
      {children}
    </span>
  )
}

function Arrow({ dir }: { dir: 'up' | 'down' }) {
  return <span style={{ fontSize: '0.95rem', lineHeight: 1, color: 'var(--gold)' }}>{dir === 'up' ? '↑' : '↓'}</span>
}
