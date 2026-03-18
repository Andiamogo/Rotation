import type { Actor, Director, Genre, RuntimeCategory } from '#/categories/movie/types'

// ── Attribut comparison results ────────────────────────────────────────────

export type ComparisonStatus = 'correct' | 'close' | 'incorrect'
export type Direction = 'up' | 'down' | 'exact'

export interface YearComparison {
  attribute: 'year'
  value: number
  status: ComparisonStatus
  direction: Direction
}

export interface CountryComparison {
  attribute: 'country'
  values: Array<{ code: string; match: boolean }>
  hasMatch: boolean
}

export interface RatingComparison {
  attribute: 'rating'
  value: number
  direction: Direction
}

export interface DirectorComparison {
  attribute: 'director'
  director: Director | null
  status: ComparisonStatus
}

export interface ActorComparison {
  attribute: 'actors'
  actors: Array<Actor & { match: boolean }>
}

export interface GenreComparison {
  attribute: 'genres'
  matchedGenres: Genre[]
}

export type AttributeComparison =
  | YearComparison
  | CountryComparison
  | RatingComparison
  | DirectorComparison
  | ActorComparison
  | GenreComparison

// ── Hints ──────────────────────────────────────────────────────────────────

export type HintType = 'genre' | 'runtime' | 'firstLetter' | 'actor' | 'director' | 'wordCount' | 'synopsis'

export interface Hint {
  type: HintType
  unlockedAtAttempt: number
  value: HintValue
}

export type HintValue =
  | { type: 'genre'; genre: Genre }
  | { type: 'runtime'; category: RuntimeCategory; minutes: number }
  | { type: 'firstLetter'; letter: string }
  | { type: 'actor'; actor: Actor }
  | { type: 'director'; director: Director }
  | { type: 'wordCount'; count: number }
  | { type: 'synopsis'; text: string }

// ── Guess & Game state ─────────────────────────────────────────────────────

export interface GuessResult {
  guessedMovieId: number
  guessedMovieTitle: string
  comparisons: AttributeComparison[]
}

export type GameOutcome = 'playing' | 'won' | 'lost'

export interface GameState {
  date: string // YYYY-MM-DD UTC
  targetMovieId: number
  attempts: number
  maxAttempts: number
  guesses: GuessResult[]
  hints: Hint[]
  outcome: GameOutcome
  // Aggregated knowledge panel
  confirmedGenres: Genre[]
  confirmedActors: Actor[]
  confirmedDirector: Director | null
  yearRange: { min: number | null; max: number | null; exact: number | null }
  confirmedCountry: string | null
}

// ── Share ──────────────────────────────────────────────────────────────────

export interface ShareData {
  date: string
  attempts: number
  maxAttempts: number
  outcome: GameOutcome
  guesses: GuessResult[]
}
