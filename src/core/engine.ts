import {
  compareActors,
  compareCountry,
  compareDirector,
  compareGenres,
  compareRating,
  compareYear,
} from '#/categories/movie/compare'
import type { Movie } from '#/categories/movie/types'
import { getRuntimeCategory } from '#/categories/movie/types'
import type { GameState, GuessResult, Hint, HintValue } from './types'

export const MAX_ATTEMPTS = 10

// Paliers de déblocage des indices (0-indexed : attempt 0 = premier essai)
const HINT_SCHEDULE: Array<{ attempt: number; type: Hint['type'] }> = [
  { attempt: 2, type: 'genre' },       // après le 3e essai
  { attempt: 3, type: 'runtime' },     // après le 4e
  { attempt: 4, type: 'firstLetter' }, // après le 5e
  { attempt: 5, type: 'actor' },       // après le 6e
  { attempt: 6, type: 'director' },    // après le 7e
  { attempt: 7, type: 'wordCount' },   // après le 8e
  { attempt: 8, type: 'synopsis' },    // après le 9e
]

export function createInitialState(targetMovieId: number, date: string): GameState {
  return {
    date,
    targetMovieId,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    guesses: [],
    hints: [],
    outcome: 'playing',
    confirmedGenres: [],
    confirmedActors: [],
    confirmedDirector: null,
    yearRange: { min: null, max: null, exact: null },
    confirmedCountry: null,
  }
}

export function submitGuess(state: GameState, guessedMovie: Movie, targetMovie: Movie): GameState {
  if (state.outcome !== 'playing') return state

  const comparisons = [
    compareYear(guessedMovie, targetMovie),
    compareCountry(guessedMovie, targetMovie),
    compareRating(guessedMovie, targetMovie),
    compareDirector(guessedMovie, targetMovie),
    compareActors(guessedMovie, targetMovie),
    compareGenres(guessedMovie, targetMovie),
  ]

  const result: GuessResult = {
    guessedMovieId: guessedMovie.id,
    guessedMovieTitle: guessedMovie.title,
    comparisons,
  }

  const newAttempts = state.attempts + 1
  const won = guessedMovie.id === targetMovie.id
  const lost = !won && newAttempts >= MAX_ATTEMPTS
  const outcome = won ? 'won' : lost ? 'lost' : 'playing'

  // Agrégation du panneau récap
  const updatedState = aggregateKnowledge({ ...state, attempts: newAttempts, guesses: [...state.guesses, result], outcome })

  // Déblocage des indices
  const newHints = unlockHints(updatedState, targetMovie)

  return { ...updatedState, hints: newHints }
}

function aggregateKnowledge(state: GameState): GameState {
  let confirmedGenres = [...state.confirmedGenres]
  let confirmedActors = [...state.confirmedActors]
  let confirmedDirector = state.confirmedDirector
  let yearRange = { ...state.yearRange }
  let confirmedCountry = state.confirmedCountry

  const lastGuess = state.guesses[state.guesses.length - 1]
  if (!lastGuess) return state

  for (const comp of lastGuess.comparisons) {
    switch (comp.attribute) {
      case 'genres': {
        for (const g of comp.genres) {
          if (g.match && !confirmedGenres.find((cg) => cg.id === g.id)) {
            confirmedGenres = [...confirmedGenres, g]
          }
        }
        break
      }
      case 'actors': {
        for (const a of comp.actors) {
          if (a.match && !confirmedActors.find((ca) => ca.id === a.id)) {
            confirmedActors = [...confirmedActors, a]
          }
        }
        break
      }
      case 'director': {
        if (comp.status === 'correct' && comp.director) {
          confirmedDirector = comp.director
        }
        break
      }
      case 'year': {
        if (comp.status === 'correct') {
          yearRange = { min: comp.value, max: comp.value, exact: comp.value }
        } else {
          // direction 'up' = target est plus récent → min augmente
          if (comp.direction === 'up' && (yearRange.min === null || comp.value > yearRange.min)) {
            yearRange = { ...yearRange, min: comp.value }
          }
          // direction 'down' = target est plus ancien → max diminue
          if (comp.direction === 'down' && (yearRange.max === null || comp.value < yearRange.max)) {
            yearRange = { ...yearRange, max: comp.value }
          }
        }
        break
      }
      case 'country': {
        if (comp.hasMatch && !confirmedCountry) {
          confirmedCountry = comp.values.find((v) => v.match)?.code ?? null
        }
        break
      }
    }
  }

  return { ...state, confirmedGenres, confirmedActors, confirmedDirector, yearRange, confirmedCountry }
}

function unlockHints(state: GameState, target: Movie): Hint[] {
  const hints = [...state.hints]
  const unlockedTypes = new Set(hints.map((h) => h.type))

  for (const schedule of HINT_SCHEDULE) {
    if (state.attempts > schedule.attempt && !unlockedTypes.has(schedule.type)) {
      const value = buildHintValue(schedule.type, target, hints)
      if (value) {
        hints.push({ type: schedule.type, unlockedAtAttempt: schedule.attempt + 1, value })
        unlockedTypes.add(schedule.type)
      }
    }
  }

  return hints
}

function buildHintValue(type: Hint['type'], target: Movie, existingHints: Hint[]): HintValue | null {
  switch (type) {
    case 'genre': {
      const knownIds = new Set(existingHints.filter((h) => h.value.type === 'genre').map((h) => (h.value as { type: 'genre'; genre: { id: number } }).genre.id))
      const unknown = target.genres.filter((g) => !knownIds.has(g.id))
      if (unknown.length === 0) return null
      const genre = unknown[Math.floor(Math.random() * unknown.length)]
      return { type: 'genre', genre }
    }
    case 'runtime':
      return { type: 'runtime', category: getRuntimeCategory(target.runtime), minutes: target.runtime }
    case 'firstLetter':
      return { type: 'firstLetter', letter: target.title.charAt(0).toUpperCase() }
    case 'actor': {
      const knownIds = new Set(existingHints.filter((h) => h.value.type === 'actor').map((h) => (h.value as { type: 'actor'; actor: { id: number } }).actor.id))
      const unknown = target.cast.filter((a) => !knownIds.has(a.id))
      if (unknown.length === 0) return null
      return { type: 'actor', actor: unknown[0] }
    }
    case 'director':
      return target.director ? { type: 'director', director: target.director } : null
    case 'wordCount':
      return { type: 'wordCount', count: target.title.trim().split(/\s+/).length }
    case 'synopsis':
      return { type: 'synopsis', text: target.overview }
  }
}
