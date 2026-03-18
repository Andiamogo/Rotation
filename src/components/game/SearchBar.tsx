import { useRef, useState } from 'react'
import type { MovieSummary } from '#/categories/movie/types'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w92'

interface Props {
  movies: MovieSummary[]
  onSelect: (movie: MovieSummary) => void
  disabled?: boolean
  alreadyGuessed: number[]
}

export function SearchBar({ movies, onSelect, disabled = false, alreadyGuessed }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [selected, setSelected] = useState<MovieSummary | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  const results = query.trim().length >= 1
    ? movies.filter((m) =>
        !alreadyGuessed.includes(m.id) &&
        (m.title.toLowerCase().includes(query.toLowerCase()) ||
         m.originalTitle.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 7)
    : []

  function pick(movie: MovieSummary) {
    setSelected(movie)
    setQuery(movie.title)
    setOpen(false)
  }

  function submit() {
    if (!selected || disabled) return
    onSelect(selected)
    setSelected(null)
    setQuery('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && results.length > 0) {
        pick(results[highlighted] ?? results[0])
      } else if (selected) {
        submit()
      }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)) }
    if (e.key === 'Escape')    { setOpen(false); setSelected(null); setQuery('') }
  }

  const showDropdown = open && results.length > 0 && !selected
  const canSubmit = !!selected && !disabled

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.9rem', pointerEvents: 'none', opacity: 0.5,
          }}>
            {selected ? '🎬' : '🔍'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            placeholder="Chercher un film…"
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
              setOpen(true)
              setHighlighted(0)
            }}
            onFocus={() => { setFocused(true); if (query.length >= 1 && !selected) setOpen(true) }}
            onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 200) }}
            onKeyDown={onKeyDown}
            style={{
              width: '100%',
              padding: '14px 14px 14px 40px',
              background: selected ? 'rgba(232,184,75,0.07)' : 'var(--bg-input)',
              border: `1.5px solid ${focused ? (selected ? 'rgba(232,184,75,0.6)' : 'rgba(255,255,255,0.2)') : 'var(--border-strong)'}`,
              borderRadius: 12,
              color: 'var(--text)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.15s, background 0.15s',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />

          {/* Dropdown */}
          {showDropdown && (
            <ul style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              background: '#1a1d2a',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 12,
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              listStyle: 'none',
              padding: 4,
            }}>
              {results.map((movie, i) => (
                <li key={movie.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); pick(movie) }}
                    onMouseEnter={() => setHighlighted(i)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 10px',
                      background: i === highlighted ? 'rgba(232,184,75,0.1)' : 'transparent',
                      border: 'none', borderRadius: 8,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      width: 34, height: 48, borderRadius: 6,
                      overflow: 'hidden', background: 'var(--bg-raised)',
                      flexShrink: 0, border: '1px solid var(--border)',
                    }}>
                      {movie.posterPath && (
                        <img
                          src={`${IMAGE_BASE}${movie.posterPath}`}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title}
                      </p>
                      {movie.title !== movie.originalTitle && (
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.72rem', marginTop: 1 }}>
                          {movie.originalTitle}
                        </p>
                      )}
                      <p style={{ color: 'var(--text-soft)', fontSize: '0.72rem', marginTop: 2 }}>
                        {movie.year} · ⭐ {movie.rating}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          style={{
            padding: '14px 22px',
            borderRadius: 12,
            fontWeight: 700, fontSize: '0.9rem',
            background: canSubmit ? 'var(--gold)' : 'var(--bg-card)',
            color: canSubmit ? '#080a0f' : 'var(--text-muted)',
            border: `1.5px solid ${canSubmit ? 'transparent' : 'var(--border-strong)'}`,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          Valider →
        </button>
      </div>

      {/* Selection confirm */}
      {selected && (
        <p style={{ fontSize: '0.75rem', color: 'var(--gold)', paddingLeft: 4 }}>
          🎬 <strong>{selected.title}</strong> sélectionné — clique sur Valider pour confirmer
        </p>
      )}
    </div>
  )
}
