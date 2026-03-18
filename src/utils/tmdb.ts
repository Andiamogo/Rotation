import type { Actor, Director, Genre, Movie, MovieSummary } from '#/categories/movie/types'

const BASE_URL = process.env.TMDB_API_BASE_URL ?? 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p'

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error('TMDB_API_KEY is not set')
  return key
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', getApiKey())
  url.searchParams.set('language', 'fr-FR')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

export function imageUrl(path: string | null, size: 'w92' | 'w185' | 'w500' | 'original' = 'w185'): string | null {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${size}${path}`
}

// ── Raw TMDB response types ────────────────────────────────────────────────

interface TmdbMovieDetail {
  id: number
  title: string
  original_title: string
  release_date: string
  genres: { id: number; name: string }[]
  production_countries: { iso_3166_1: string; name: string }[]
  vote_average: number
  vote_count: number
  runtime: number
  overview: string
  poster_path: string | null
  adult: boolean
}

interface TmdbCredits {
  cast: {
    id: number
    name: string
    character: string
    profile_path: string | null
    order: number
  }[]
  crew: {
    id: number
    name: string
    job: string
    profile_path: string | null
  }[]
}

interface TmdbSearchResult {
  results: {
    id: number
    title: string
    original_title: string
    release_date: string
    poster_path: string | null
    vote_count: number
    vote_average: number
  }[]
}

interface TmdbDiscoverResult {
  results: TmdbSearchResult['results']
  total_pages: number
  page: number
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function searchMovies(query: string): Promise<MovieSummary[]> {
  const data = await tmdbFetch<TmdbSearchResult>('/search/movie', { query })
  return data.results.map(toMovieSummary)
}

export async function getMovieDetails(id: number): Promise<Movie> {
  const [detail, credits] = await Promise.all([
    tmdbFetch<TmdbMovieDetail>(`/movie/${id}`),
    tmdbFetch<TmdbCredits>(`/movie/${id}/credits`),
  ])

  const director = credits.crew.find((c) => c.job === 'Director') ?? null

  return {
    id: detail.id,
    title: detail.title,
    originalTitle: detail.original_title,
    year: Number(detail.release_date.slice(0, 4)),
    genres: detail.genres as Genre[],
    countries: detail.production_countries.map((c) => c.iso_3166_1),
    rating: Math.round(detail.vote_average * 10) / 10,
    voteCount: detail.vote_count,
    runtime: detail.runtime,
    overview: detail.overview,
    posterPath: detail.poster_path,
    director: director
      ? { id: director.id, name: director.name, profilePath: director.profile_path }
      : null,
    cast: credits.cast.map((a) => ({
      id: a.id,
      name: a.name,
      character: a.character,
      profilePath: a.profile_path,
      order: a.order,
    })),
  }
}

export async function discoverEligibleMovies(page: number): Promise<{ movies: MovieSummary[]; totalPages: number }> {
  const data = await tmdbFetch<TmdbDiscoverResult>('/discover/movie', {
    sort_by: 'vote_count.desc',
    'vote_count.gte': '10000',
    'vote_average.gte': '6.0',
    without_genres: '10749,18,27,53,10752', // exclut romance, drama, horreur, thriller, guerre pour garder des films mémorables — ajustable
    include_adult: 'false',
    page: String(page),
  })
  return {
    movies: data.results.map(toMovieSummary),
    totalPages: data.total_pages,
  }
}

function toMovieSummary(r: TmdbSearchResult['results'][number]): MovieSummary {
  return {
    id: r.id,
    title: r.title,
    originalTitle: r.original_title,
    year: Number((r.release_date ?? '0000').slice(0, 4)),
    posterPath: r.poster_path,
    voteCount: r.vote_count,
    rating: Math.round(r.vote_average * 10) / 10,
  }
}
