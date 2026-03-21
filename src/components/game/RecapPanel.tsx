import type { GameState } from '#/core/types'
import { Calendar, Globe, Star, Users, Clapperboard } from 'lucide-react'
import { HintList } from './HintBadge'
import { PersonCard } from './PersonCard'
import { CountryBadge } from './CountryBadge'

interface RecapPanelProps {
  state: GameState
}

export function RecapPanel({ state }: RecapPanelProps) {
  if (state.outcome === 'won') return null

  const { confirmedGenres, confirmedActors, confirmedDirector, yearRange, ratingRange, confirmedCountry, hints, guesses } = state

  const lastGenreComp = guesses.flatMap((g) => g.comparisons).filter((c) => c.attribute === 'genres').pop()
  const targetGenreCount = lastGenreComp && 'targetCount' in lastGenreComp ? lastGenreComp.targetCount : null

  const hasRating = ratingRange.exact !== null || ratingRange.min !== null || ratingRange.max !== null
  const hasChips =
    confirmedGenres.length > 0 ||
    yearRange.exact !== null || yearRange.min !== null || yearRange.max !== null ||
    hasRating ||
    confirmedCountry

  const hasContent = hasChips || confirmedDirector || confirmedActors.length > 0 || hints.length > 0

  if (!hasContent) return null

  const yearExact = yearRange.exact !== null
  const yearLabel =
    yearRange.exact !== null ? `${yearRange.exact}`
    : yearRange.min !== null && yearRange.max !== null ? `${yearRange.min} – ${yearRange.max}`
    : yearRange.min !== null ? `Après ${yearRange.min}`
    : yearRange.max !== null ? `Avant ${yearRange.max}`
    : null

  const ratingExact = ratingRange.exact !== null
  const ratingLabel =
    ratingRange.exact !== null ? `${ratingRange.exact}`
    : ratingRange.min !== null && ratingRange.max !== null ? `${ratingRange.min} – ${ratingRange.max}`
    : ratingRange.min !== null ? `Supérieur à ${ratingRange.min}`
    : ratingRange.max !== null ? `Inférieur à ${ratingRange.max}`
    : null

  return (
    <div
      className="slide-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--gold-border)',
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: 'inset 0 0 18px rgba(255,238,183,0.07), inset 0 0 2px rgba(255,209,58,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Title */}
      <p style={{
        fontSize: '0.62rem',
        fontWeight: 800,
        letterSpacing: '0.14em',
        color: 'var(--gold)',
        textTransform: 'uppercase',
      }}>
        Ce que tu sais
      </p>

      {/* Year, rating & country */}
      {(yearLabel || ratingLabel || confirmedCountry) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {yearLabel && (
            <span className={yearExact ? 'gold-pill' : 'unknown-pill'}>
              <span className={yearExact ? 'gold-pill-icon' : ''} style={yearExact ? undefined : { display: 'flex', opacity: 0.5 }}><Calendar size={10} /></span>
              {yearLabel}
            </span>
          )}
          {ratingLabel && (
            <span className={ratingExact ? 'gold-pill' : 'unknown-pill'}>
              <span className={ratingExact ? 'gold-pill-icon' : ''} style={ratingExact ? undefined : { display: 'flex', opacity: 0.5 }}><Star size={10} /></span>
              {ratingLabel}
            </span>
          )}
          {confirmedCountry && (
            <span className="gold-pill">
              <span className="gold-pill-icon"><Globe size={10} /></span>
              <CountryBadge code={confirmedCountry} />
            </span>
          )}
        </div>
      )}

      {/* Genres */}
      {(confirmedGenres.length > 0 || (targetGenreCount && targetGenreCount > confirmedGenres.length)) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {confirmedGenres.map((g) => (
            <span key={g.id} className="gold-pill">
              <span className="gold-pill-icon"><Clapperboard size={10} /></span>
              {g.name}
            </span>
          ))}
          {targetGenreCount && Array.from({ length: targetGenreCount - confirmedGenres.length }, (_, i) => (
            <span key={`unknown-${i}`} className="unknown-pill">
              <span style={{ display: 'flex', opacity: 0.5 }}><Clapperboard size={10} /></span>
              ?
            </span>
          ))}
        </div>
      )}

      {/* Director */}
      {confirmedDirector && (
        <Section icon={<Clapperboard size={10} />} label="Réalisateur">
          <PersonCard name={confirmedDirector.name} profilePath={confirmedDirector.profilePath} status="correct" size="sm" />
        </Section>
      )}

      {/* Actors */}
      {confirmedActors.length > 0 && (
        <Section icon={<Users size={10} />} label={`Acteurs confirmés — ${confirmedActors.length}`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {confirmedActors.map((a) => (
              <PersonCard key={a.id} name={a.name} profilePath={a.profilePath} status="correct" size="sm" />
            ))}
          </div>
        </Section>
      )}

      {/* Hints */}
      {hints.length > 0 && (
        <Section icon={null} label="Indices">
          <HintList hints={hints} />
        </Section>
      )}
    </div>
  )
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid rgba(212,168,67,0.15)', paddingTop: 12 }}>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon && <span style={{ display: 'flex', opacity: 0.7 }}>{icon}</span>}
        {label}
      </p>
      {children}
    </div>
  )
}
