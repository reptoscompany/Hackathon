export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function riskTone(score: number) {
  if (score >= 80) return 'high'
  if (score >= 65) return 'medium'
  return 'low'
}

export function riskLabel(score: number) {
  if (score >= 80) return 'High'
  if (score >= 65) return 'Medium'
  return 'Low'
}
