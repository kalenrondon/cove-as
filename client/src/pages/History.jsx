import { useState, useEffect } from 'react'
import { api } from '../api'
import { formatCost } from '../utils/currency'

export default function History() {
  const [data, setData] = useState(null)
  const [families, setFamilies] = useState([])
  const [familyFilter, setFamilyFilter] = useState('todas')
  const [monthFilter, setMonthFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [expandedTx, setExpandedTx] = useState({})

  useEffect(() => {
    api.getFamilies().then(setFamilies).catch(() => {})
  }, [])

  const loadHistory = (fam, mon, typ) => {
    const params = new URLSearchParams()
    if (fam && fam !== 'todas') params.set('family', fam)
    if (mon) params.set('month', mon)
    if (typ && typ !== 'todos') params.set('type', typ)
    api.getHistory(params.toString()).then(setData).catch(() => {})
  }

  useEffect(() => { loadHistory(familyFilter, monthFilter, typeFilter) }, [familyFilter, monthFilter, typeFilter])

  const months = []
  if (data) {
    const mset = new Set()
    data.transactions.forEach(t => {
      if (!t.date) return
      const d = new Date(t.date)
      if (isNaN(d.getTime())) return
      mset.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })
    ;[...mset].sort().reverse().forEach(m => months.push(m))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">📋 Historial de Cuentas</h2>

      {data && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">${formatCost(data.totalIngresos)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Metas</p>
            <p className="text-lg font-bold text-red-500 dark:text-red-400">${formatCost(data.totalGastos)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p className={`text-lg font-bold ${data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              ${formatCost(data.balance)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <select value={familyFilter} onChange={e => setFamilyFilter(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none">
          <option value="todas">Todas las familias</option>
          {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none">
          <option value="">Todos los meses</option>
          {months.map(m => {
            const [y, mo] = m.split('-')
            const label = new Date(y, mo - 1).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
            return <option key={m} value={m}>{label}</option>
          })}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 outline-none">
          <option value="todos">Todos los tipos</option>
          <option value="pago">Pagos</option>
          <option value="gasto">Metas</option>
        </select>
      </div>

      <div className="space-y-1">
        {data?.transactions.map((t, i) => {
          const isOpen = expandedTx[i]
          const dateObj = new Date(t.date)
          const dateStr = dateObj.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
          const isPago = t.tipo === 'pago'
          const roundStr = t.round_concept ? ` · ${t.round_concept}` : ''
          const typeLabels = { family_split: '👨‍👩‍👧‍👦 Dividido', future: '🔮 Futuro', direct: '✨ Extra', regular: '' }
          const typeBadge = t.payment_type && typeLabels[t.payment_type]

          return (
            <div key={`${t.tipo}-${t.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                onClick={() => setExpandedTx(p => ({ ...p, [i]: !p[i] }))}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span>{isPago ? '💰' : '🎯'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate dark:text-gray-200">
                      {t.description || (isPago ? 'Pago' : 'Meta')}{roundStr}
                      {typeBadge && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300">{typeBadge}</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{dateStr}{t.person_name ? ` · ${t.person_name}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {t.family_name && (
                    <span className="text-xs text-gray-400 hidden sm:inline">{t.family_name}</span>
                  )}
                  <span className={`text-sm font-bold ${isPago ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {isPago ? '+' : '-'}${formatCost(t.amount)}
                  </span>
                  <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
              {isOpen && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                  <p><span className="font-semibold">Tipo:</span> {isPago ? 'Pago' : 'Meta'}</p>
                  {t.payment_type && t.payment_type !== 'regular' && (
                    <p><span className="font-semibold">Subtipo:</span> {typeLabels[t.payment_type] || t.payment_type}</p>
                  )}
                  {t.person_name && <p><span className="font-semibold">Persona:</span> {t.person_name}</p>}
                  {t.family_name && <p><span className="font-semibold">Familia:</span> {t.family_name}</p>}
                  {t.round_concept && <p><span className="font-semibold">Ronda:</span> {t.round_concept}</p>}
                  <p><span className="font-semibold">Fecha:</span> {dateStr}</p>
                  {t.description && <p><span className="font-semibold">Detalle:</span> {t.description}</p>}
                </div>
              )}
            </div>
          )
        })}
        {data?.transactions.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No hay movimientos con estos filtros</p>
        )}
      </div>
    </div>
  )
}
