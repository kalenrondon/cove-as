import { useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.login(password)
      sessionStorage.setItem('admin_token', res.token)
      onLogin()
      navigate('/admin')
    } catch {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-primary dark:text-primary-light mb-6">🔑 Acceso Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-light focus:border-transparent outline-none"
              placeholder="Ingresa la contraseña"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary-light transition-colors">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
