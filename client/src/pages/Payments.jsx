import { useState, useEffect, useMemo } from 'react'
import { api } from '../api'
import { getRoundMessage, getFamilyMessage } from '../costeno'
import { formatCost } from '../utils/currency'

function confirmar(msg) { return window.confirm(msg) }

export default function Payments() {
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [details, setDetails] = useState({})
  const [collapseFam, setCollapseFam] = useState({})

  useEffect(() => { api.getPaymentRounds().then(d => { setRounds(d); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const handleDeletePayment = async (roundId, personId, personName) => {
    if (!confirmar(`¿Eliminar el pago de ${personName} en esta ronda?`)) return
    await api.deleteRoundPayment(roundId, personId)
    const d = await api.getPaymentRoundDetail(roundId)
    setDetails(prev => ({ ...prev, [roundId]: d }))
  }

  const sortedRounds = useMemo(() =>
    [...rounds].sort((a, b) => {
      const aDone = a.pending_count === 0 ? 1 : 0
      const bDone = b.pending_count === 0 ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      return new Date(b.date) - new Date(a.date)
    }), [rounds])

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  const totalRecaudado = rounds.reduce((s, r) => s + r.total_paid, 0)
  const totalEsperado = rounds.reduce((s, r) => s + r.total_expected, 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">💰 Pagos</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Recaudado: <span className="font-bold text-green-600 dark:text-green-400">${formatCost(totalRecaudado)}</span>
          {totalEsperado > 0 && <> · Meta: <span className="font-semibold">${formatCost(totalEsperado)}</span></>}
        </p>
      </div>

      <div className="space-y-4">
        {sortedRounds.map(r => {
          const pct = r.total_expected > 0 ? Math.round((r.total_paid / r.total_expected) * 100) : 0
          const isOpen = expanded[r.id]
          const detail = details[r.id]

          return (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-primary to-primary-light text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={() => { setExpanded(p => ({ ...p, [r.id]: !p[r.id] })); if (!details[r.id]) api.getPaymentRoundDetail(r.id).then(d => setDetails(prev => ({ ...prev, [r.id]: d }))) }} className="text-lg hover:scale-110 shrink-0">
                    {isOpen ? '▼' : '▶'}
                  </button>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{r.concept}</p>
                    <p className="text-xs text-white/80">{new Date(r.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })} · ${formatCost(r.amount_per_person)} c/u</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{r.paid_count} de {r.amount_per_person > 0 ? (r.total_expected / r.amount_per_person).toFixed(0) : '?'} pagaron</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">${formatCost(r.total_paid)} / ${formatCost(r.total_expected)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                </div>
                <p className="text-xs italic text-gray-500 dark:text-gray-400">{getRoundMessage(r)}</p>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-700 max-h-80 overflow-y-auto">
                  {!detail && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center cursor-pointer" onClick={async () => {
                      const d = await api.getPaymentRoundDetail(r.id)
                      setDetails(p => ({ ...p, [r.id]: d }))
                    }}>Cargar detalle</div>
                  )}
                  {detail && (() => {
                    const grouped = {}
                    detail.people.forEach(p => {
                      const key = p.family_name || 'Sin familia'
                      if (!grouped[key]) grouped[key] = { color: p.family_color || '#9CA3AF', members: [] }
                      grouped[key].members.push(p)
                    })
                    return Object.entries(grouped).map(([familyName, group]) => {
                      const famPaid = group.members.filter(m => m.payment_count > 0).length
                      const famTotal = group.members.reduce((s, m) => s + (m.paid_amount || 0), 0)
                      const allFullyPaid = group.members.every(m => m.payment_count > 0 && m.paid_amount >= r.amount_per_person)
                      const famKey = `${r.id}-${familyName}`
                      const isFamCollapsed = collapseFam[famKey] ?? allFullyPaid
                      return (
                        <div key={familyName} className={`border-b border-gray-100 dark:border-gray-700 last:border-0 ${allFullyPaid ? 'opacity-70' : ''}`}>
                          <div className="px-4 py-1.5 flex items-center justify-between text-xs font-semibold bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 sticky top-0 cursor-pointer select-none"
                            onClick={() => setCollapseFam(p => ({ ...p, [famKey]: !isFamCollapsed }))}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{isFamCollapsed ? '▶' : '▼'}</span>
                              <span style={{ color: group.color }}>●</span>
                              <span>{familyName}</span>
                              <span className="font-normal text-gray-400">({famPaid}/{group.members.length})</span>
                              {allFullyPaid && <span className="text-green-600 dark:text-green-400 text-xs ml-1">✅</span>}
                            </div>
                            <span>${formatCost(famTotal)}</span>
                          </div>
                          <p className="px-4 py-1 text-[10px] italic text-gray-400 dark:text-gray-500">{getFamilyMessage(familyName, famPaid, group.members.length)}</p>
                          {!isFamCollapsed && (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {group.members.map(p => {
                                const hasPayment = p.payment_count > 0
                                const fullyPaid = hasPayment && p.paid_amount >= r.amount_per_person
                                return (
                                  <div key={p.id} className={`px-4 py-2 flex items-center justify-between ${hasPayment ? 'bg-green-50/50 dark:bg-green-900/5' : ''}`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`text-base ${hasPayment ? '' : 'opacity-30'}`} style={{ color: group.color }}>●</span>
                                      <span className={`text-sm truncate ${fullyPaid ? 'dark:text-gray-400 line-through' : 'dark:text-gray-200 font-medium'}`}>{p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                      {hasPayment && (
                                        <span className={`text-xs font-semibold ${fullyPaid ? 'text-green-600' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                          ${formatCost(p.paid_amount || 0)}{fullyPaid ? '' : '/' + formatCost(r.amount_per_person)}
                                        </span>
                                      )}
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${!hasPayment ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' : fullyPaid ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200'}`}>
                                        {!hasPayment ? '⏳ Pendiente' : fullyPaid ? '✅ Pagó' : '💰 Abonó'}
                                      </span>
                                      {hasPayment && sessionStorage.getItem('admin_token') && (
                                        <button onClick={() => handleDeletePayment(r.id, p.id, p.name)} className="text-xs text-red-400 hover:text-red-600 hover:underline ml-1" title="Eliminar pago">✕</button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  })()}
                  {detail?.people?.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">Sin personas registradas</div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {rounds.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No hay rondas de cobro aún</p>
        )}
      </div>
    </div>
  )
}
