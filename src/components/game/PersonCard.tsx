import { useRef, useState } from 'react'
import { ImageModal } from './ImageModal'

const IMAGE_BASE_SM = 'https://image.tmdb.org/t/p/w185'
const IMAGE_BASE_LG = 'https://image.tmdb.org/t/p/w500'

interface PersonCardProps {
  name: string
  profilePath: string | null
  subtitle?: string
  status?: 'correct' | 'incorrect' | 'neutral'
  size?: 'sm' | 'md'
}

export function PersonCard({ name, profilePath, subtitle, status = 'neutral', size = 'md' }: PersonCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | undefined>(undefined)
  const avatarRef = useRef<HTMLDivElement>(null)
  const dim = size === 'sm' ? 40 : 56
  const borderColor =
    status === 'correct'   ? 'var(--correct)' :
    status === 'incorrect' ? '#f87171' :
    'var(--border-hover)'

  const hasPhoto = !!profilePath
  const largeSrc = profilePath ? `${IMAGE_BASE_LG}${profilePath}` : null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center', maxWidth: 72 }}>
        <div
          ref={avatarRef}
          onClick={hasPhoto ? () => {
            setOriginRect(avatarRef.current?.getBoundingClientRect())
            setModalOpen(true)
          } : undefined}
          style={{
            width: dim, height: dim, borderRadius: '50%', overflow: 'hidden',
            border: `2px solid ${borderColor}`,
            background: 'var(--bg-raised)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasPhoto ? 'zoom-in' : 'default',
            transition: 'transform 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => { if (hasPhoto) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
        >
          {profilePath ? (
            <img
              src={`${IMAGE_BASE_SM}${profilePath}`}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
            />
          ) : (
            <span style={{ color: 'var(--text-soft)', fontSize: '1.1rem', fontWeight: 700 }}>
              {name.charAt(0)}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
          {name}
        </span>
        {subtitle && (
          <span style={{ fontSize: '0.6rem', color: 'var(--text-soft)' }}>{subtitle}</span>
        )}
      </div>

      {modalOpen && largeSrc && (
        <ImageModal src={largeSrc} alt={name} originRect={originRect} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
