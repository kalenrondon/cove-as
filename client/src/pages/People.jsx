import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'
import { formatCost } from '../utils/currency'

export default function People() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => { api.getPeople().then(d => { setPeople(d); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const grouped = useMemo(() => {
    const g = {}
    people.forEach(p => {
      const key = p.family_name || 'Sin familia'
      if (!g[key]) g[key] = { color: p.family_color || '#9CA3AF', members: [] }
      g[key].members.push(p)
    })
    return g
  }, [people])

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  const familyTotal = (members) => formatCost(members.reduce((s, m) => s + (m.total_paid || 0), 0))
  const familyExpected = (members) => members.reduce((s, m) => s + (m.total_expected || 0), 0)

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">👥 Familia</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{people.length} personas · {Object.keys(grouped).length} familias</p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([familyName, group]) => {
          const head = group.members.find(m => m.is_head)
          const nohead = group.members.filter(m => !m.is_head)
          const isOpen = expanded[familyName]
          const famTotalPaid = group.members.reduce((s, m) => s + (m.total_paid || 0), 0)
          const famTotalExpected = group.members.reduce((s, m) => s + (m.total_expected || 0), 0)
          const famBalance = famTotalPaid - famTotalExpected

          return (
            <div key={familyName} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="px-4 py-3 text-white font-bold flex items-center gap-2" style={{ backgroundColor: group.color }}>
                <button onClick={() => setExpanded(p => ({ ...p, [familyName]: !p[familyName] }))} className="text-lg hover:scale-110 shrink-0">
                  {isOpen ? '▼' : '▶'}
                </button>
                <span className="truncate">{familyName}</span>
                <span className="font-normal text-white/80 text-xs shrink-0">({group.members.length})</span>
                <span className={`text-xs font-semibold ml-auto ${famBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  ${formatCost(famTotalPaid)}{famTotalExpected > 0 && <span className="text-white/60 font-normal">/${formatCost(famTotalExpected)}</span>}
                </span>
              </div>

              {!isOpen && head && (
                <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate">👑 {head.name}</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold shrink-0 ml-2">${familyTotal(group.members)}</span>
                </div>
              )}

              {isOpen && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
                  {head && (
                    <div className="px-4 py-2.5 flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">👑</span>
                        <span className="font-medium text-sm dark:text-gray-200 truncate">{head.name}</span>
                        <span className="text-xs bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded font-medium shrink-0">Cabeza</span>
                      </div>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0 ml-2">${formatCost(head.total_paid || 0)}</span>
                    </div>
                  )}
                  {nohead.map(p => (
                    <div key={p.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <span className="text-sm dark:text-gray-200 truncate">{p.name}</span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 shrink-0 ml-2">${formatCost(p.total_paid || 0)}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 flex items-center justify-between bg-primary/5 dark:bg-primary/10 font-semibold text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total familia</span>
                    <span className="text-green-600 dark:text-green-400">${familyTotal(group.members)}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
