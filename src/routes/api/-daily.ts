import { createServerFn } from '@tanstack/react-start'
import type { MovieSummary } from '#/categories/movie/types'
import { getDailyIndex, getTodayUtcString } from '#/core/seed'
import { getMovieDetails } from '#/utils/tmdb'

let cachedMovies: MovieSummary[] | null = null

async function loadMovies(): Promise<MovieSummary[]> {
  if (cachedMovies) return cachedMovies
  const { readFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  const filePath = join(process.cwd(), 'public', 'movies.json')
  const raw = readFileSync(filePath, 'utf-8')
  cachedMovies = JSON.parse(raw) as MovieSummary[]
  return cachedMovies
}

export const getDailyData = createServerFn({ method: 'GET' }).handler(async () => {
  const movies = await loadMovies()
  const today = getTodayUtcString()
  const idx = getDailyIndex(movies.length, new Date())
  const dailySummary = movies[idx]

  const targetMovie = await getMovieDetails(dailySummary.id)

  return {
    movies,
    targetMovie,
    date: today,
  }
})

export const fetchMovieById = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => {
    const { movieId } = input as { movieId: number }
    if (typeof movieId !== 'number' || !Number.isFinite(movieId)) {
      throw new Error('movieId invalide')
    }
    return { movieId }
  })
  .handler(async ({ data: { movieId } }) => {
    return getMovieDetails(movieId)
  })
