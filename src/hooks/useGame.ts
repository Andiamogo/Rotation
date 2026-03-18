import { useCallback, useEffect, useState } from 'react'
import type { Movie, MovieSummary } from '#/categories/movie/types'
import { createInitialState, submitGuess } from '#/core/engine'
import type { GameState } from '#/core/types'
import { getTodayUtcString } from '#/core/seed'
import { storageGet, storageSet } from '#/utils/storage'
import { fetchMovieById } from '#/routes/api/-daily'

const STORAGE_KEY = 'cinédle:gameState'

export function useGame(
  targetMovie: Movie | null,
) {
  const today = getTodayUtcString()

  const [state, setState] = useState<GameState>(() =>
    createInitialState(targetMovie?.id ?? 0, today)
  )
  const [guessing, setGuessing] = useState(false)

  // Après hydration, restaurer depuis localStorage
  useEffect(() => {
    if (!targetMovie) return
    const saved = storageGet<GameState>(STORAGE_KEY)
    if (saved && saved.date === today && saved.targetMovieId === targetMovie.id) {
      setState(saved)
    } else {
      setState(createInitialState(targetMovie.id, today))
    }
  }, [targetMovie?.id, today])

  // Persister à chaque changement
  useEffect(() => {
    if (state.targetMovieId !== 0) {
      storageSet(STORAGE_KEY, state)
    }
  }, [state])

  const guess = useCallback(
    async (movie: MovieSummary) => {
      if (!targetMovie || state.outcome !== 'playing' || guessing) return
      setGuessing(true)
      try {
        const fullGuess = await fetchMovieById({ data: { movieId: movie.id } })
        setState((prev) => submitGuess(prev, fullGuess, targetMovie))
      } finally {
        setGuessing(false)
      }
    },
    [targetMovie, state.outcome, guessing],
  )

  const alreadyGuessed = state.guesses.map((g) => g.guessedMovieId)

  return { state, guess, alreadyGuessed, guessing }
}
