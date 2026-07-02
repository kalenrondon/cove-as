import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Budget() {
  const [data, setData] = useState(null)

  useEffect(() => { api.getBudget().then(setData).catch(() => setData({ categories: [], people: [], totalGoal: 0, totalCollected: 0 })) }, [])

  if (!data) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  const perPerson = data.totalGoal / Math.max(data.people.length, 1)

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">💰 Presupuesto del Viaje</h2>

      {/* Global progress */}
      {data.totalGoal > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold dark:text-gray-100">Total</span>
            <span className="font-bold text-lg text-green-600 dark:text-green-400">
              ${data.totalCollected.toLocaleString('es-CO')} / ${data.totalGoal.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${Math.min((data.totalCollected / data.totalGoal) * 100, 100)}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {data.people.length} personas · ${perPerson.toLocaleString('es-CO')} por persona
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.categories.map(cat => {
          const pct = cat.goal > 0 ? Math.round((cat.collected / cat.goal) * 100) : 0
          return (
            <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-sm dark:text-gray-100">{cat.name}</h3>
              <p className="text-xs text-gray-400 mb-2">${cat.goal.toLocaleString('es-CO')} meta</p>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-1">
                <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }}></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{pct}%</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">${cat.collected.toLocaleString('es-CO')}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Per person */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-200">
          Aportes por persona
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.people.map(p => {
            const pct = perPerson > 0 ? Math.round((p.total_paid / perPerson) * 100) : 0
            return (
              <div key={p.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium dark:text-gray-200 truncate">{p.name}</span>
                    {p.family_name && <span className="text-xs text-gray-400">({p.family_name})</span>}
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0 ml-2">
                    ${p.total_paid.toLocaleString('es-CO')} / ${perPerson.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
