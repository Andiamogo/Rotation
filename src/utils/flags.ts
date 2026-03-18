const COUNTRY_NAMES: Record<string, string> = {
  US: 'États-Unis', GB: 'Royaume-Uni', FR: 'France', DE: 'Allemagne',
  IT: 'Italie', ES: 'Espagne', JP: 'Japon', AU: 'Australie',
  CA: 'Canada', KR: 'Corée du Sud', CN: 'Chine', IN: 'Inde',
  BR: 'Brésil', MX: 'Mexique', NZ: 'Nouvelle-Zélande', IE: 'Irlande',
  SE: 'Suède', DK: 'Danemark', NO: 'Norvège', FI: 'Finlande',
  NL: 'Pays-Bas', BE: 'Belgique', CH: 'Suisse', AT: 'Autriche',
  PL: 'Pologne', CZ: 'Tchéquie', HU: 'Hongrie', RU: 'Russie',
  ZA: 'Afrique du Sud', AR: 'Argentine', IL: 'Israël', TR: 'Turquie',
}

export function countryFlagUrl(code: string): string {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`
}

export function countryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase()
}
