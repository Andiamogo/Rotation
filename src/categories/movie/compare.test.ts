import { describe, expect, it } from 'vitest'
import type { Movie } from './types'
import { compareActors, compareCountry, compareDirector, compareGenres, compareRating, compareYear } from './compare'

const baseMovie = (overrides: Partial<Movie> = {}): Movie => ({
  id: 1,
  title: 'Film test',
  originalTitle: 'Test Film',
  year: 2000,
  genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Aventure' }],
  countries: ['US'],
  rating: 7.5,
  voteCount: 50000,
  runtime: 120,
  overview: 'Un film test.',
  posterPath: null,
  director: { id: 10, name: 'Réalisateur Test', profilePath: null },
  cast: [
    { id: 1, name: 'Acteur A', character: 'Héros', profilePath: null, order: 0 },
    { id: 2, name: 'Acteur B', character: 'Méchant', profilePath: null, order: 1 },
  ],
  ...overrides,
})

// ── compareYear ──

describe('compareYear', () => {
  it('exact', () => {
    const r = compareYear(baseMovie({ year: 2000 }), baseMovie({ year: 2000 }))
    expect(r.status).toBe('correct')
    expect(r.direction).toBe('exact')
  })

  it('proche (±5)', () => {
    const r = compareYear(baseMovie({ year: 1997 }), baseMovie({ year: 2000 }))
    expect(r.status).toBe('close')
    expect(r.direction).toBe('up') // target est plus récent
  })

  it('loin', () => {
    const r = compareYear(baseMovie({ year: 1980 }), baseMovie({ year: 2000 }))
    expect(r.status).toBe('incorrect')
    expect(r.direction).toBe('up')
  })

  it('direction down quand guess > target', () => {
    const r = compareYear(baseMovie({ year: 2010 }), baseMovie({ year: 2000 }))
    expect(r.direction).toBe('down')
  })
})

// ── compareCountry ──

describe('compareCountry', () => {
  it('match exact', () => {
    const r = compareCountry(baseMovie({ countries: ['FR'] }), baseMovie({ countries: ['FR'] }))
    expect(r.hasMatch).toBe(true)
    expect(r.values).toEqual([{ code: 'FR', match: true }])
  })

  it('marque chaque pays individuellement', () => {
    const r = compareCountry(baseMovie({ countries: ['FR', 'US'] }), baseMovie({ countries: ['US'] }))
    expect(r.hasMatch).toBe(true)
    expect(r.values).toEqual([{ code: 'FR', match: false }, { code: 'US', match: true }])
  })

  it('pas de match', () => {
    const r = compareCountry(baseMovie({ countries: ['DE'] }), baseMovie({ countries: ['FR'] }))
    expect(r.hasMatch).toBe(false)
    expect(r.values).toEqual([{ code: 'DE', match: false }])
  })
})

// ── compareRating ──

describe('compareRating', () => {
  it('exact', () => {
    const r = compareRating(baseMovie({ rating: 7.5 }), baseMovie({ rating: 7.5 }))
    expect(r.direction).toBe('exact')
  })

  it('up quand guess < target', () => {
    const r = compareRating(baseMovie({ rating: 6.0 }), baseMovie({ rating: 8.0 }))
    expect(r.direction).toBe('up')
  })

  it('down quand guess > target', () => {
    const r = compareRating(baseMovie({ rating: 9.0 }), baseMovie({ rating: 7.0 }))
    expect(r.direction).toBe('down')
  })
})

// ── compareDirector ──

describe('compareDirector', () => {
  it('même réalisateur', () => {
    const r = compareDirector(
      baseMovie({ director: { id: 10, name: 'A', profilePath: null } }),
      baseMovie({ director: { id: 10, name: 'A', profilePath: null } })
    )
    expect(r.status).toBe('correct')
  })

  it('réalisateur différent', () => {
    const r = compareDirector(
      baseMovie({ director: { id: 10, name: 'A', profilePath: null } }),
      baseMovie({ director: { id: 99, name: 'B', profilePath: null } })
    )
    expect(r.status).toBe('incorrect')
  })
})

// ── compareActors ──

describe('compareActors', () => {
  it('marque les acteurs en commun', () => {
    const guess = baseMovie({ cast: [{ id: 1, name: 'Acteur A', character: '', profilePath: null, order: 0 }] })
    const target = baseMovie({ cast: [{ id: 1, name: 'Acteur A', character: '', profilePath: null, order: 0 }, { id: 3, name: 'Acteur C', character: '', profilePath: null, order: 1 }] })
    const r = compareActors(guess, target)
    expect(r.actors[0].match).toBe(true)
  })

  it('marque les acteurs non présents', () => {
    const guess = baseMovie({ cast: [{ id: 99, name: 'Inconnu', character: '', profilePath: null, order: 0 }] })
    const r = compareActors(guess, baseMovie())
    expect(r.actors[0].match).toBe(false)
  })
})

// ── compareGenres ──

describe('compareGenres', () => {
  it('genres en commun', () => {
    const r = compareGenres(
      baseMovie({ genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drame' }] }),
      baseMovie({ genres: [{ id: 28, name: 'Action' }] })
    )
    expect(r.matchedGenres).toHaveLength(1)
    expect(r.matchedGenres[0].id).toBe(28)
  })

  it('aucun genre en commun', () => {
    const r = compareGenres(
      baseMovie({ genres: [{ id: 18, name: 'Drame' }] }),
      baseMovie({ genres: [{ id: 28, name: 'Action' }] })
    )
    expect(r.matchedGenres).toHaveLength(0)
  })
})
