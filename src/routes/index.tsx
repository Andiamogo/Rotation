import { createFileRoute } from '@tanstack/react-router'
import { ClientOnly } from '#/components/ClientOnly'
import { SearchBar } from '#/components/game/SearchBar'
import { GuessRow } from '#/components/game/GuessRow'
import { RecapPanel } from '#/components/game/RecapPanel'
import { EndScreen } from '#/components/game/EndScreen'
import { useGame } from '#/hooks/useGame'
import { getDailyData } from './api/-daily'
import type { Movie, MovieSummary } from '#/categories/movie/types'

export const Route = createFileRoute('/')({
  loader: () => getDailyData(),
  component: GamePage,
})

function GamePage() {
  const { movies, targetMovie } = Route.useLoaderData()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PageHeader />
      <main style={{ flex: 1, width: '100%', maxWidth: 680, margin: '0 auto', padding: '24px 16px 48px' }}>
        <ClientOnly fallback={<LoadingState />}>
          <Game movies={movies} targetMovie={targetMovie} />
        </ClientOnly>
      </main>
    </div>
  )
}

function Game({
  movies,
  targetMovie,
}: {
  movies: MovieSummary[]
  targetMovie: Movie
}) {
  const { state, guess, alreadyGuessed, guessing } = useGame(targetMovie)
  const isOver = state.outcome !== 'playing'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Search or End screen */}
      {isOver ? (
        <EndScreen state={state} targetMovie={targetMovie} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SearchBar movies={movies} onSelect={guess} disabled={guessing} alreadyGuessed={alreadyGuessed} />
          <LivesDisplay attempts={state.attempts} maxAttempts={state.maxAttempts} />
        </div>
      )}

      {/* Recap panel */}
      <RecapPanel state={state} />

      {/* Guesses */}
      {state.guesses.length > 0 ? (
        <section>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 12 }}>
            Essais — {state.guesses.length} / {state.maxAttempts}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...state.guesses].reverse().map((result, i) => (
              <GuessRow key={result.guessedMovieId} result={result} index={state.guesses.length - 1 - i} />
            ))}
          </div>
        </section>
      ) : !isOver ? (
        <EmptyState maxAttempts={state.maxAttempts} />
      ) : null}
    </div>
  )
}

function PageHeader() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'linear-gradient(180deg, #0d1018 0%, var(--bg-raised) 100%)',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontFamily: '"Bebas Neue", Impact, sans-serif',
            fontSize: '2.2rem',
            letterSpacing: '0.18em',
            color: 'var(--gold)',
            lineHeight: 1,
          }}>
            CINÉDLE
          </h1>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-soft)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
            Le film du jour
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '1.2rem' }}>🎬</span>
        </div>
      </div>
    </header>
  )
}

function LivesDisplay({ attempts, maxAttempts }: { attempts: number; maxAttempts: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: maxAttempts }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i >= maxAttempts - attempts ? 'var(--border-strong)' : 'var(--gold)',
          transition: 'background 0.3s',
          flexShrink: 0,
        }} />
      ))}
      <span style={{ fontSize: '0.62rem', color: 'var(--text-soft)', marginLeft: 6 }}>
        {maxAttempts - attempts} restant{maxAttempts - attempts > 1 ? 's' : ''}
      </span>
    </div>
  )
}

function EmptyState({ maxAttempts }: { maxAttempts: number }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.6 }}>🎞️</div>
      <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>
        Quel film as-tu en tête ?
      </p>
      <p style={{ color: 'var(--text-soft)', fontSize: '0.82rem', lineHeight: 1.6 }}>
        Tape un titre dans la barre ci-dessus.<br />
        Tu as <strong style={{ color: 'var(--gold)' }}>{maxAttempts} essais</strong> pour trouver le film du jour.
      </p>
      <div style={{ marginTop: 20 }}>
        <LivesDisplay attempts={0} maxAttempts={maxAttempts} />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--text-soft)',
      fontSize: '0.875rem',
    }}>
      Chargement…
    </div>
  )
}
