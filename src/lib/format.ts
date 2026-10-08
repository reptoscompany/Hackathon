export const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value)
export const formatPercent = (value: number) => `${value}%`
export const upper = (value: string) => value.toUpperCase()
