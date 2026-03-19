import { useRef, useState } from 'react'
import type { MovieSummary } from '#/categories/movie/types'
import { Search, Clapperboard } from 'lucide-react'

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
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: selected ? 'var(--gold)' : 'var(--text-soft)',
            display: 'flex', pointerEvents: 'none',
          }}>
            {selected ? <Clapperboard size={16} /> : <Search size={16} />}
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
              padding: '14px 14px 14px 44px',
              background: selected ? 'rgba(212,168,67,0.07)' : 'var(--bg-input)',
              border: `2px solid ${focused ? 'var(--gold)' : selected ? 'var(--gold-border)' : 'var(--gold-border)'}`,
              borderRadius: 50,
              color: 'var(--text)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              boxShadow: focused ? 'inset 0 0 18px rgba(255,238,183,0.1), inset 0 0 2px rgba(255,209,58,0.3)' : 'inset 0 0 18px rgba(255,238,183,0.07), inset 0 0 2px rgba(255,209,58,0.25)',
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
              background: '#111628',
              border: '1.5px solid var(--gold-border)',
              borderRadius: 14,
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 20px var(--gold-glow)',
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
                      background: i === highlighted ? 'var(--gold-dim)' : 'transparent',
                      border: 'none', borderRadius: 10,
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
            padding: '14px 28px',
            borderRadius: 50,
            fontWeight: 700, fontSize: '0.95rem',
            letterSpacing: '0.03em',
            background: canSubmit ? 'transparent' : 'transparent',
            color: canSubmit ? 'var(--gold-light)' : 'var(--text-muted)',
            border: `2px solid ${canSubmit ? 'var(--gold)' : 'var(--gold-border)'}`,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            flexShrink: 0,
            boxShadow: canSubmit ? 'inset 0 0 18px rgba(255,238,183,0.1), inset 0 0 2px rgba(255,209,58,0.3)' : 'inset 0 0 18px rgba(255,238,183,0.07), inset 0 0 2px rgba(255,209,58,0.25)',
          }}
        >
          Valider
        </button>
      </div>
    </div>
  )
}
