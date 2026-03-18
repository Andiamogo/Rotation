/**
 * Génère un index stable basé sur la date UTC.
 * Tous les joueurs obtiennent le même film le même jour calendaire UTC.
 */
export function getDailyIndex(listLength: number, date: Date = new Date()): number {
  const dateStr = date.toISOString().slice(0, 10) // "YYYY-MM-DD" UTC
  const hash = cyrb53(dateStr)
  return hash % listLength
}

export function getTodayUtcString(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Hash 53-bit stable et déterministe (cyrb53).
 * Source : https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}
