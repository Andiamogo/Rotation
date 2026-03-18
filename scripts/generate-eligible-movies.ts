/**
 * Script de génération de la liste de films éligibles.
 * Usage : bun scripts/generate-eligible-movies.ts
 *
 * Requiert TMDB_API_KEY dans .env
 * Génère public/movies.json
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_API_KEY
if (!API_KEY) throw new Error('TMDB_API_KEY manquante dans .env')

const MIN_VOTES = 1_000
const MIN_RATING = 0
const MAX_PAGES = 500 // TMDB limite à 500 pages

interface TmdbMovie {
  id: number
  title: string
  original_title: string
  release_date: string
  poster_path: string | null
  vote_count: number
  vote_average: number
  genre_ids: number[]
}

interface TmdbDiscoverResponse {
  page: number
  total_pages: number
  results: TmdbMovie[]
}

async function fetchPage(page: number): Promise<TmdbDiscoverResponse> {
  const url = new URL(`${BASE_URL}/discover/movie`)
  url.searchParams.set('api_key', API_KEY!)
  url.searchParams.set('language', 'fr-FR')
  url.searchParams.set('sort_by', 'vote_count.desc')
  url.searchParams.set('vote_count.gte', String(MIN_VOTES))
  url.searchParams.set('vote_average.gte', String(MIN_RATING))
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('page', String(page))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB ${res.status} page ${page}`)
  return res.json() as Promise<TmdbDiscoverResponse>
}

async function main() {
  console.log('Génération de la liste de films éligibles...')

  const first = await fetchPage(1)
  const totalPages = Math.min(first.total_pages, MAX_PAGES)
  console.log(`${totalPages} pages à récupérer`)

  const allMovies: TmdbMovie[] = [...first.results]

  // Fetch par lots de 10 pour éviter le rate limiting
  for (let page = 2; page <= totalPages; page += 10) {
    const batch = Array.from({ length: Math.min(10, totalPages - page + 1) }, (_, i) =>
      fetchPage(page + i)
    )
    const results = await Promise.all(batch)
    for (const r of results) allMovies.push(...r.results)

    process.stdout.write(`\r${page + 9}/${totalPages} pages`)
    // Petite pause pour respecter le rate limit TMDB (40 req/10s)
    await new Promise((r) => setTimeout(r, 300))
  }

  // Dédoublonner par ID
  const seen = new Set<number>()
  const unique = allMovies.filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  // Filtrer : données minimales présentes
  const eligible = unique.filter(
    (m) =>
      m.release_date &&
      m.vote_count >= MIN_VOTES &&
      m.vote_average >= MIN_RATING
  )

  // Trier par vote_count décroissant (les plus populaires en premier)
  eligible.sort((a, b) => b.vote_count - a.vote_count)

  const output = eligible.map((m) => ({
    id: m.id,
    title: m.title,
    originalTitle: m.original_title,
    year: Number((m.release_date ?? '0000').slice(0, 4)),
    posterPath: m.poster_path,
    voteCount: m.vote_count,
    rating: Math.round(m.vote_average * 10) / 10,
  }))

  const outPath = join(import.meta.dir, '..', 'public', 'movies.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n✓ ${output.length} films éligibles → public/movies.json`)
}

main().catch(console.error)
