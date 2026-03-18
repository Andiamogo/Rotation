import { describe, expect, it } from 'vitest'
import { getDailyIndex } from './seed'

describe('getDailyIndex', () => {
  it('retourne un index dans les bornes', () => {
    const idx = getDailyIndex(100)
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(100)
  })

  it('est déterministe pour la même date', () => {
    const date = new Date('2025-06-15T12:00:00Z')
    expect(getDailyIndex(1000, date)).toBe(getDailyIndex(1000, date))
  })

  it('est différent pour deux dates différentes', () => {
    const d1 = new Date('2025-06-15T00:00:00Z')
    const d2 = new Date('2025-06-16T00:00:00Z')
    // Très improbable qu'ils soient égaux
    expect(getDailyIndex(10000, d1)).not.toBe(getDailyIndex(10000, d2))
  })

  it('ignore l\'heure (basé sur date UTC)', () => {
    const matin = new Date('2025-06-15T06:00:00Z')
    const soir = new Date('2025-06-15T22:00:00Z')
    expect(getDailyIndex(1000, matin)).toBe(getDailyIndex(1000, soir))
  })
})
