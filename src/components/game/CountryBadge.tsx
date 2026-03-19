import { countryFlagUrl, countryName } from '#/utils/flags'

interface CountryBadgeProps {
  code: string
  highlight?: boolean
}

export function CountryBadge({ code, highlight = false }: CountryBadgeProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <img
        src={countryFlagUrl(code)}
        alt={countryName(code)}
        style={{
          width: 20, height: 14,
          borderRadius: 2,
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      />
      <span style={{ color: highlight ? 'var(--correct)' : 'inherit' }}>
        {countryName(code)}
      </span>
    </span>
  )
}
