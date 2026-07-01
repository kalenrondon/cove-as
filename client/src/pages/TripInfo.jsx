import { useState, useEffect } from 'react'
import { api } from '../api'

export default function TripInfo() {
  const [info, setInfo] = useState({})

  useEffect(() => { api.getTripInfo().then(setInfo).catch(() => {}) }, [])

  const start = new Date(info.trip_date_start || '2027-01-02')
  const end = new Date(info.trip_date_end || '2027-01-07')
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary dark:text-primary-light">ℹ️ Información del Viaje</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🏖️</span>
          <div>
            <h3 className="text-2xl font-bold text-primary dark:text-primary-light">{info.trip_name || 'Viaje a Coveñas 2027'}</h3>
            <p className="text-gray-500 dark:text-gray-400">{info.trip_description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Origen</p>
            <p className="font-semibold dark:text-gray-200">📍 {info.trip_origin}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Destino</p>
            <p className="font-semibold dark:text-gray-200">🏖️ {info.trip_destination}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de inicio</p>
            <p className="font-semibold dark:text-gray-200">📅 {new Date(info.trip_date_start).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de fin</p>
            <p className="font-semibold dark:text-gray-200">📅 {new Date(info.trip_date_end).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="bg-accent/10 dark:bg-accent/20 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Duración del viaje</p>
          <p className="text-3xl font-bold text-accent">{days} días</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">📌 Detalles del Grupo</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>👥 <strong>Familia:</strong> Grupo grande de la familia</li>
          <li>🚗 <strong>Ruta:</strong> El Copey, Cesar → Coveñas, Sucre</li>
          <li>💰 <strong>Organización:</strong> Aportes voluntarios para gastos compartidos</li>
          <li>🎯 <strong>Actividades:</strong> Por definir entre todos</li>
        </ul>
      </div>
    </div>
  )
}
