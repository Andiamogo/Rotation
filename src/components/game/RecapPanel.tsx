import type { GameState } from '#/core/types'
import { Calendar, Globe, Users, Clapperboard } from 'lucide-react'
import { HintList } from './HintBadge'
import { PersonCard } from './PersonCard'
import { CountryBadge } from './CountryBadge'

interface RecapPanelProps {
  state: GameState
}

export function RecapPanel({ state }: RecapPanelProps) {
  if (state.outcome === 'won') return null

  const { confirmedGenres, confirmedActors, confirmedDirector, yearRange, confirmedCountry, hints, guesses } = state

  // Derive target genre count from the latest genre comparison
  const lastGenreComp = guesses.flatMap((g) => g.comparisons).filter((c) => c.attribute === 'genres').pop()
  const targetGenreCount = lastGenreComp && 'targetCount' in lastGenreComp ? lastGenreComp.targetCount : null

  const hasContent =
    confirmedGenres.length > 0 ||
    confirmedActors.length > 0 ||
    confirmedDirector ||
    yearRange.exact !== null || yearRange.min !== null || yearRange.max !== null ||
    confirmedCountry ||
    hints.length > 0

  if (!hasContent) return null

  const yearLabel =
    yearRange.exact !== null ? `${yearRange.exact}`
    : yearRange.min !== null && yearRange.max !== null ? `${yearRange.min} – ${yearRange.max}`
    : yearRange.min !== null ? `Après ${yearRange.min}`
    : yearRange.max !== null ? `Avant ${yearRange.max}`
    : null

  const hasAttributes = yearLabel || confirmedCountry

  return (
    <div
      className="slide-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase' }}>
        Ce que tu sais
      </p>

      {/* Attributes row: year + country as inline chips */}
      {hasAttributes && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {yearLabel && (
            <InfoChip icon={<Calendar size={11} />} exact={yearRange.exact !== null}>
              {yearLabel}
            </InfoChip>
          )}
          {confirmedCountry && (
            <InfoChip icon={<Globe size={11} />} exact>
              <CountryBadge code={confirmedCountry} highlight />
            </InfoChip>
          )}
        </div>
      )}

      {/* Genres */}
      {confirmedGenres.length > 0 && (
        <Section
          icon={<Clapperboard size={11} />}
          label="Genres"
          count={targetGenreCount ? `${confirmedGenres.length}/${targetGenreCount}` : `${confirmedGenres.length}`}
          status="correct"
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {confirmedGenres.map((g) => (
              <span key={g.id} className="pop" style={{
                padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(74,222,128,0.1)', color: 'var(--correct)',
                border: '1px solid rgba(74,222,128,0.3)',
              }}>
                {g.name}
              </span>
            ))}
            {targetGenreCount && Array.from({ length: targetGenreCount - confirmedGenres.length }, (_, i) => (
              <span key={`unknown-${i}`} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-soft)',
                border: '1px solid var(--border)',
              }}>
                ?
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Director */}
      {confirmedDirector && (
        <Section icon={<Clapperboard size={11} />} label="Réalisateur">
          <PersonCard name={confirmedDirector.name} profilePath={confirmedDirector.profilePath} status="correct" size="sm" />
        </Section>
      )}

      {/* Actors */}
      {confirmedActors.length > 0 && (
        <Section icon={<Users size={11} />} label="Acteurs confirmés" count={`${confirmedActors.length}`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {confirmedActors.map((a) => (
              <PersonCard key={a.id} name={a.name} profilePath={a.profilePath} status="correct" size="sm" />
            ))}
          </div>
        </Section>
      )}

      {/* Hints */}
      {hints.length > 0 && (
        <Section label="Indices">
          <HintList hints={hints} />
        </Section>
      )}
    </div>
  )
}

function InfoChip({ icon, exact, children }: { icon: React.ReactNode; exact: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 99,
      background: exact ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${exact ? 'rgba(74,222,128,0.35)' : 'var(--border)'}`,
      fontSize: '0.82rem', fontWeight: 700,
      color: exact ? 'var(--correct)' : 'var(--text)',
    }}>
      <span style={{ display: 'flex', opacity: 0.7, color: exact ? 'var(--correct)' : 'var(--text-soft)' }}>{icon}</span>
      {children}
    </div>
  )
}

function Section({ icon, label, count, children }: {
  icon?: React.ReactNode
  label: string
  count?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
        {icon && <span style={{ color: 'var(--text-soft)', display: 'flex', opacity: 0.7 }}>{icon}</span>}
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-soft)', textTransform: 'uppercase' }}>
          {label}
        </p>
        {count && (
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--correct)', marginLeft: 2 }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
