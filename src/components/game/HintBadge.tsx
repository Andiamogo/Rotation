import { useRef, useState } from 'react'
import type { Hint } from '#/core/types'
import { ImageModal } from './ImageModal'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w92'
const IMAGE_BASE_LG = 'https://image.tmdb.org/t/p/w500'

const ICONS: Record<Hint['type'], string> = {
  genre:       '🎭',
  runtime:     '⏱',
  firstLetter: '🔤',
  actor:       '🎬',
  director:    '🎥',
  wordCount:   '📝',
  synopsis:    '📖',
}

export function HintList({ hints }: { hints: Hint[] }) {
  const synopsis = hints.find((h) => h.value.type === 'synopsis')
  const others = hints.filter((h) => h.value.type !== 'synopsis')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Compact chips row */}
      {others.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {others.map((h) => <HintChip key={h.type} hint={h} />)}
        </div>
      )}

      {/* Synopsis separate — full width, smaller text */}
      {synopsis && synopsis.value.type === 'synopsis' && (
        <div style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: '0.75rem' }}>{ICONS.synopsis}</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--gold)', textTransform: 'uppercase' as const }}>Synopsis</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: 0 }}>
            {synopsis.value.text}
          </p>
        </div>
      )}
    </div>
  )
}

function HintChip({ hint }: { hint: Hint }) {
  const v = hint.value

  // Person hints: inline photo + name, clickable
  if (v.type === 'actor' || v.type === 'director') {
    const person = v.type === 'actor' ? v.actor : v.director
    const label = v.type === 'actor' ? 'Acteur' : 'Réal.'
    return <PersonChip person={person} label={label} />
  }

  // Text hints: icon + label + value inline
  const content = (() => {
    switch (v.type) {
      case 'genre':       return v.genre.name
      case 'runtime':     return `${v.category === 'court' ? 'Court' : v.category === 'moyen' ? 'Moyen' : 'Long'} — ${v.minutes} min`
      case 'firstLetter': return `« ${v.letter} »`
      case 'wordCount':   return `${v.count} mot${v.count > 1 ? 's' : ''}`
    }
  })()

  const label = (() => {
    switch (v.type) {
      case 'genre':       return 'Genre'
      case 'runtime':     return 'Durée'
      case 'firstLetter': return 'Lettre'
      case 'wordCount':   return 'Mots'
    }
  })()

  return (
    <div className="pop" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 10px', borderRadius: 99,
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-hover)',
    }}>
      <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{ICONS[hint.type]}</span>
      <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{content}</span>
    </div>
  )
}

function PersonChip({ person, label }: { person: { name: string; profilePath: string | null }; label: string }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | undefined>(undefined)
  const avatarRef = useRef<HTMLDivElement>(null)
  const hasPhoto = !!person.profilePath

  return (
    <>
      <div className="pop" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '4px 10px 4px 4px', borderRadius: 99,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-hover)',
      }}>
        <div
          ref={avatarRef}
          onClick={hasPhoto ? () => {
            setOriginRect(avatarRef.current?.getBoundingClientRect())
            setModalOpen(true)
          } : undefined}
          style={{
            width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--bg-card)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasPhoto ? 'zoom-in' : 'default',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => { if (hasPhoto) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
        >
          {person.profilePath ? (
            <img src={`${IMAGE_BASE}${person.profilePath}`} alt={person.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
          ) : (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)' }}>
              {person.name.charAt(0)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
            {label}
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>
            {person.name}
          </span>
        </div>
      </div>

      {modalOpen && person.profilePath && (
        <ImageModal
          src={`${IMAGE_BASE_LG}${person.profilePath}`}
          alt={person.name}
          originRect={originRect}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
