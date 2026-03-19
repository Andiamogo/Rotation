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
  const dim = size === 'sm' ? 44 : 56
  const isCorrect = status === 'correct'
  const borderColor =
    isCorrect              ? 'transparent' :
    status === 'incorrect' ? '#f87171' :
    'var(--gold-border)'

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
            width: dim, height: dim, borderRadius: '50%',
            padding: isCorrect ? 2 : 0,
            background: isCorrect ? 'var(--gold-gradient)' : 'none',
            flexShrink: 0,
            cursor: hasPhoto ? 'zoom-in' : 'default',
            transition: 'transform 0.15s',
            boxShadow: isCorrect ? '0 0 10px rgba(212,168,67,0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => { if (hasPhoto) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
        >
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
            border: isCorrect ? 'none' : `2px solid ${borderColor}`,
            background: 'var(--bg-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
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
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
          {name}
        </span>
        {subtitle && (
          <span style={{ fontSize: '0.58rem', color: 'var(--text-soft)' }}>{subtitle}</span>
        )}
      </div>

      {modalOpen && largeSrc && (
        <ImageModal src={largeSrc} alt={name} originRect={originRect} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
