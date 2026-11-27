import type { Language } from '../i18n'

const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

// Display-only formatting. No calculation happens here.
export function formatNumber(value: number, language: Language, maxFraction = 0): string {
  const fixed = Math.abs(value).toFixed(maxFraction)
  const [whole, fraction] = fixed.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, language === 'ar' ? '٬' : ',')
  const text = fraction && Number(fraction) > 0 ? `${grouped}${language === 'ar' ? '٫' : '.'}${fraction}` : grouped
  const sign = value < 0 ? '-' : ''
  const out = sign + text
  return language === 'ar' ? out.replace(/\d/g, (d) => arabicDigits[Number(d)]) : out
}

export function formatPercent(value: number, language: Language, withSign = true): string {
  const sign = withSign && value > 0 ? '+' : ''
  const body = formatNumber(value, language, 1)
  return `${sign}${body}%`
}
