import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'
import { formatCost } from '../utils/currency'

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todas')

  useEffect(() => { api.getExpenses().then(d => { setExpenses(d); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const categories = useMemo(() => ['Todas', ...new Set(expenses.map(e => e.category))], [expenses])
  const filtered = useMemo(() => filter === 'Todas' ? expenses : expenses.filter(e => e.category === filter), [expenses, filter])
  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const categoryTotals = useMemo(() => {
    const ct = {}
    expenses.forEach(e => { ct[e.category] = (ct[e.category] || 0) + e.amount })
    return ct
  }, [expenses])
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(e => { if (!g[e.category]) g[e.category] = []; g[e.category].push(e) })
    return g
  }, [filtered])

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">🎯 Metas Estimadas</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total metas: <span className="font-bold text-red-500 dark:text-red-400">${formatCost(total)}</span></p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => setFilter('Todas')}
          className={`text-left bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border transition-all ${filter === 'Todas' ? 'border-primary dark:border-primary-light ring-2 ring-primary/20' : 'border-gray-100 dark:border-gray-700'}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400">Todas</p>
          <p className="font-bold text-sm dark:text-gray-200">${formatCost(total)}</p>
        </button>
        {Object.entries(categoryTotals).map(([cat, amt]) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-left bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border transition-all ${filter === cat ? 'border-primary dark:border-primary-light ring-2 ring-primary/20' : 'border-gray-100 dark:border-gray-700'}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">{cat}</p>
            <p className="font-bold text-sm dark:text-gray-200">${formatCost(amt)}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-200 flex justify-between items-center">
              <span>{cat}</span>
              <span className="text-red-500 dark:text-red-400 font-bold">${formatCost(items.reduce((s, e) => s + e.amount, 0))}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
              {items.map(e => (
                <div key={e.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-gray-200 truncate">{e.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(e.date).toLocaleDateString('es-CO')}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500 dark:text-red-400 shrink-0 ml-2">${formatCost(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No hay metas registradas</p>
        )}
      </div>
    </div>
  )
}
