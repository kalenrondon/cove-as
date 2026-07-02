import { useState, useEffect } from 'react'
import { api } from '../api'

function formatDate(dateStr) {
  try { return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }) }
  catch { return dateStr }
}
function formatShortDate(dateStr) {
  try { return new Date(dateStr).toLocaleDateString('es-CO') }
  catch { return dateStr }
}
function formatCost(cost) {
  try { return Number(cost).toLocaleString('es-CO') }
  catch { return '0' }
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.getEvents().then(d => { setEvents(d); setLoading(false) }).catch(() => setLoading(false)) }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  let future = [], past = []
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    future = events.filter(e => e && e.date && new Date(e.date + 'T00:00:00') >= today)
    past = events.filter(e => e && (!e.date || new Date(e.date + 'T00:00:00') < today))
  } catch {}

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">🎉 Eventos y Actividades</h2>

      {future.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Próximos</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {future.map(ev => (
              <div key={ev.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-primary dark:text-primary-light">{ev.title}</h4>
                {ev.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ev.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {ev.date && <span>📅 {formatDate(ev.date)}</span>}
                  {ev.time && <span>⏰ {ev.time}</span>}
                  {ev.location && <span>📍 {ev.location}</span>}
                  {ev.cost > 0 && <span>💰 ${formatCost(ev.cost)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">📋 Pasados</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y dark:divide-gray-700">
            {past.map(ev => (
              <div key={ev.id} className="px-4 py-3">
                <h4 className="font-medium text-sm dark:text-gray-200">{ev.title}</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {ev.date && formatShortDate(ev.date)}
                  {ev.time && ` - ${ev.time}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-2">🎉</p>
          <p>No hay eventos planificados aún</p>
        </div>
      )}
    </div>
  )
}
