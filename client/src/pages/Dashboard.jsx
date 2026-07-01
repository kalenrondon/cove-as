import { useState, useEffect } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [tripInfo, setTripInfo] = useState({})

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => {})
    api.getTripInfo().then(setTripInfo).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const start = new Date(tripInfo.trip_date_start || '2027-01-02')
  const daysLeft = Math.ceil((start - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{tripInfo.trip_name || 'Viaje a Coveñas 2027'}</h1>
        <p className="text-white/80 text-sm sm:text-base">
          {tripInfo.trip_origin} → {tripInfo.trip_destination}
        </p>
        <p className="text-white/80 text-sm sm:text-base">
          {tripInfo.trip_date_start} al {tripInfo.trip_date_end}
        </p>
        <div className="mt-4 inline-block bg-white/20 rounded-xl px-4 py-2">
          <span className="text-2xl sm:text-3xl font-bold">{daysLeft > 0 ? daysLeft : 0}</span>
          <span className="text-white/80 ml-2">días para el viaje</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link to="/personas" className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-1">👥</div>
          <div className="text-2xl font-bold text-primary dark:text-primary-light">{data.totalPeople}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Personas</div>
        </Link>
        <Link to="/personas" className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-1">🏠</div>
          <div className="text-2xl font-bold text-primary dark:text-primary-light">{data.totalFamilies}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Familias</div>
        </Link>
        <Link to="/pagos" className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-1">💰</div>
          <div className="text-2xl font-bold text-accent">${(data.totalPayments || 0).toLocaleString('es-CO')}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Recaudado</div>
        </Link>
        <Link to="/eventos" className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-1">🎉</div>
          <div className="text-2xl font-bold text-primary dark:text-primary-light">{data.totalEvents}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Eventos</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">💰 Resumen Financiero</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 dark:text-gray-400">Total recaudado</span>
              <span className="font-semibold text-green-600 dark:text-green-400">${(data.totalPayments || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 dark:text-gray-400">Total gastado</span>
              <span className="font-semibold text-red-500 dark:text-red-400">${(data.totalExpenses || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="border-t dark:border-gray-700 pt-2 flex justify-between items-center">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Balance</span>
              <span className={`font-bold text-lg ${data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                ${(data.balance || 0).toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">🎯 Próximos Eventos</h3>
          {data.upcomingEvents?.length > 0 ? (
            <div className="space-y-2">
              {data.upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-2 py-1">
                  <span>📅</span>
                  <div>
                    <p className="font-medium text-sm">{ev.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ev.date ? new Date(ev.date).toLocaleDateString('es-CO') : 'Sin fecha'}{ev.time ? ` - ${ev.time}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay eventos próximos</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Últimos Pagos Registrados</h3>
        {data.recentPayments?.length > 0 ? (
          <div className="space-y-2">
            {data.recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-sm dark:text-gray-200">{p.person_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.date).toLocaleDateString('es-CO')}</p>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">${p.amount.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-sm">No hay pagos registrados aún</p>
        )}
      </div>
    </div>
  )
}
