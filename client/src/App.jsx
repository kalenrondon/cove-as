import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { api } from './api'
import ErrorBoundary from './ErrorBoundary'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import Payments from './pages/Payments'
import Expenses from './pages/Expenses'
import History from './pages/History'
import Events from './pages/Events'
import Budget from './pages/Budget'
import Admin from './pages/Admin'
import Login from './pages/Login'
import TripInfo from './pages/TripInfo'

const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

export default function App() {
  const [isAdmin, setIsAdmin] = useState(!!sessionStorage.getItem('admin_token'))
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setIsAdmin(false)
  }

  const navItems = [
    { path: '/', label: 'Inicio', icon: '📊' },
    { path: '/personas', label: 'Familia', icon: '👥' },
    { path: '/pagos', label: 'Pagos', icon: '💰' },
    { path: '/gastos', label: 'Gastos', icon: '🧾' },
    { path: '/eventos', label: 'Eventos', icon: '🎉' },
    { path: '/historial', label: 'Historial', icon: '📋' },
    { path: '/presupuesto', label: 'Aporte', icon: '🎯' },
    { path: '/info', label: 'Info', icon: 'ℹ️' },
  ]

  return (
    <ThemeContext.Provider value={dark}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <nav className="bg-primary dark:bg-[#072e40] text-white shadow-lg sticky top-0 z-50 transition-colors">
          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl truncate">
                <span>🏖️</span>
                <span className="truncate">Coveñas 2027</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title={dark ? 'Modo claro' : 'Modo oscuro'}>
                  {dark ? '☀️' : '🌙'}
                </button>
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === item.path ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    🔧 Admin
                  </Link>
                )}
                {isAdmin ? (
                  <button onClick={handleLogout} className="ml-2 px-3 py-2 rounded-lg text-sm bg-red-500/80 hover:bg-red-500 transition-colors">
                    Salir
                  </button>
                ) : (
                  <Link to="/login" className="ml-2 px-3 py-2 rounded-lg text-sm bg-secondary/80 hover:bg-secondary transition-colors">
                    Admin
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1 md:hidden">
                <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
                  {dark ? '☀️' : '🌙'}
                </button>
                <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {menuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {menuOpen && (
              <div className="md:hidden pb-3 space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm ${
                      location.pathname === item.path ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm ${
                      location.pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    🔧 Admin
                  </Link>
                )}
                {isAdmin ? (
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm bg-red-500/80">
                    Cerrar sesión
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm bg-secondary/80">
                    🔑 Acceder como Admin
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/personas" element={<People />} />
            <Route path="/pagos" element={<Payments />} />
            <Route path="/gastos" element={<Expenses />} />
            <Route path="/eventos" element={<ErrorBoundary><Events /></ErrorBoundary>} />
            <Route path="/historial" element={<History />} />
            <Route path="/presupuesto" element={<Budget />} />
            <Route path="/info" element={<TripInfo />} />
            <Route path="/login" element={<Login onLogin={() => setIsAdmin(true)} />} />
            <Route path="/admin" element={<ErrorBoundary><Admin isAdmin={isAdmin} /></ErrorBoundary>} />
          </Routes>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}
