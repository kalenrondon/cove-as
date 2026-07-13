export function formatCurrency(v) {
  const c = String(v || '').replace(/[^\d,]/g, '')
  const p = c.split(',')
  if (p.length > 2) return v
  const i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return p.length === 2 ? `${i},${p[1]}` : i
}

export function parseCurrency(v) {
  const n = parseFloat(String(v || '').replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function formatCost(n) {
  try { return Number(n).toLocaleString('es-CO') } catch { return '0' }
}
