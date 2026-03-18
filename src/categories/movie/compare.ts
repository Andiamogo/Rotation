import type { Movie } from './types'
import type {
  ActorComparison,
  CountryComparison,
  DirectorComparison,
  GenreComparison,
  RatingComparison,
  YearComparison,
} from '#/core/types'

export function compareYear(guess: Movie, target: Movie): YearComparison {
  const diff = guess.year - target.year
  if (diff === 0) {
    return { attribute: 'year', value: guess.year, status: 'correct', direction: 'exact' }
  }
  const status = Math.abs(diff) <= 5 ? 'close' : 'incorrect'
  const direction = diff < 0 ? 'up' : 'down'
  return { attribute: 'year', value: guess.year, status, direction }
}

export function compareCountry(guess: Movie, target: Movie): CountryComparison {
  const targetSet = new Set(target.countries)
  const values = guess.countries.map((c) => ({ code: c, match: targetSet.has(c) }))
  return { attribute: 'country', values, hasMatch: values.some((v) => v.match) }
}

export function compareRating(guess: Movie, target: Movie): RatingComparison {
  const diff = guess.rating - target.rating
  const direction = diff === 0 ? 'exact' : diff < 0 ? 'up' : 'down'
  const status = diff === 0 ? 'correct' : Math.abs(diff) <= 1 ? 'close' : 'incorrect'
  return { attribute: 'rating', value: guess.rating, status, direction }
}

export function compareDirector(guess: Movie, target: Movie): DirectorComparison {
  if (!guess.director) {
    return { attribute: 'director', director: null, status: 'incorrect' }
  }
  const match = target.director?.id === guess.director.id
  return {
    attribute: 'director',
    director: guess.director,
    status: match ? 'correct' : 'incorrect',
  }
}

export function compareActors(guess: Movie, target: Movie): ActorComparison {
  const targetIds = new Set(target.cast.map((a) => a.id))
  return {
    attribute: 'actors',
    actors: guess.cast.map((a) => ({ ...a, match: targetIds.has(a.id) })),
  }
}

export function compareGenres(guess: Movie, target: Movie): GenreComparison {
  const targetIds = new Set(target.genres.map((g) => g.id))
  const genres = guess.genres.map((g) => ({ ...g, match: targetIds.has(g.id) }))
  const matchedCount = genres.filter((g) => g.match).length
  return { attribute: 'genres', genres, matchedCount, targetCount: target.genres.length }
}
