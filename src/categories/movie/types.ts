export interface Actor {
  id: number
  name: string
  character: string
  profilePath: string | null
  order: number
}

export interface Director {
  id: number
  name: string
  profilePath: string | null
}

export interface Movie {
  id: number
  title: string
  originalTitle: string
  year: number
  genres: Genre[]
  countries: string[]
  rating: number
  voteCount: number
  runtime: number
  overview: string
  posterPath: string | null
  director: Director | null
  cast: Actor[]
}

export interface Genre {
  id: number
  name: string
}

export type RuntimeCategory = 'court' | 'moyen' | 'long'

export function getRuntimeCategory(minutes: number): RuntimeCategory {
  if (minutes < 90) return 'court'
  if (minutes <= 135) return 'moyen'
  return 'long'
}

// Minimal version stored in the eligible list (no cast/director — fetched on demand)
export interface MovieSummary {
  id: number
  title: string
  originalTitle: string
  year: number
  posterPath: string | null
  voteCount: number
  rating: number
}
