import { useState, useEffect } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'
import { formatCost } from '../utils/currency'
import { getFamilyMessage } from '../costeno'

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

      {/* Pending payments alert */}
      {data.activeRounds?.length > 0 && (
        <Link to="/pagos" className="block">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-yellow-800 dark:text-yellow-200">
                  {data.activeRounds.length} ronda{data.activeRounds.length > 1 ? 's' : ''} pendiente{data.activeRounds.length > 1 ? 's' : ''} de pago
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 truncate">
                  {data.activeRounds.map(r => r.concept).join(' · ')}
                </p>
              </div>
              <span className="text-yellow-600 dark:text-yellow-400 text-sm shrink-0">Ver más →</span>
            </div>
          </div>
        </Link>
      )}

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
          <div className="text-2xl font-bold text-accent">${formatCost(data.totalPayments || 0)}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Recaudado</div>
        </Link>
        <Link to="/gastos" className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
          <div className="text-3xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-primary dark:text-primary-light">${formatCost(data.totalExpenses || 0)}</div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Meta</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">💰 Resumen Financiero</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 dark:text-gray-400">Total recaudado</span>
              <span className="font-semibold text-green-600 dark:text-green-400">${formatCost(data.totalPayments || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 dark:text-gray-400">Meta</span>
              <span className="font-semibold text-red-500 dark:text-red-400">${formatCost(data.totalExpenses || 0)}</span>
            </div>
            <div className="border-t dark:border-gray-700 pt-2 flex justify-between items-center">
              <span className="font-semibold text-gray-800 dark:text-gray-200">Balance</span>
              <span className={`font-bold text-lg ${data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                ${formatCost(data.balance || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Family status cards */}
      {data.familyStats?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Estado por familia 👪</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.familyStats.map(f => (
              <Link key={f.id} to="/pagos" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }}></span>
                  <span className="font-bold text-sm dark:text-gray-200 truncate">{f.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${f.paid_count >= f.member_count ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200'}`}>
                    {f.paid_count}/{f.member_count}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">${formatCost(f.total_paid)}</span>
                </div>
                <p className="text-[10px] italic text-gray-400 dark:text-gray-500 leading-tight">{getFamilyMessage(f.name, f.paid_count, f.member_count)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">💰 Últimos Pagos Registrados</h3>
          {data.recentPayments?.length > 0 ? (
            <div className="space-y-2">
              {data.recentPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-sm dark:text-gray-200">{p.person_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.date).toLocaleDateString('es-CO')}</p>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">${formatCost(p.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay pagos registrados aún</p>
          )}
        </div>
      </div>
    </div>
  )
}
