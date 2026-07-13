import { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { api } from './api'
import ErrorBoundary from './ErrorBoundary'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const People = lazy(() => import('./pages/People'))
const Payments = lazy(() => import('./pages/Payments'))
const Expenses = lazy(() => import('./pages/Expenses'))
const History = lazy(() => import('./pages/History'))
const Budget = lazy(() => import('./pages/Budget'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const TripInfo = lazy(() => import('./pages/TripInfo'))

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
    { path: '/gastos', label: 'Metas', icon: '🎯' },
    { path: '/historial', label: 'Historial', icon: '📋' },
    { path: '/presupuesto', label: 'Aporte', icon: '📈' },
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
              <div className="md:hidden pb-4">
                {/* Quick user area */}
                <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 mb-2">
                  <span className="text-sm font-semibold text-white/80">🏖️ Coveñas 2027</span>
                  <button onClick={() => setDark(!dark)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm" title={dark ? 'Modo claro' : 'Modo oscuro'}>
                    {dark ? '☀️' : '🌙'}
                  </button>
                </div>
                {/* Main nav - grid layout */}
                <div className="grid grid-cols-4 gap-1.5 px-2 mb-3">
                  {navItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex flex-col items-center gap-0.5 py-3 px-1 rounded-xl text-xs font-medium transition-all ${
                        location.pathname === item.path
                          ? 'bg-white/20 scale-95'
                          : 'hover:bg-white/10 active:scale-95'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] leading-tight text-center text-white/90">{item.label}</span>
                    </Link>
                  ))}
                </div>
                {/* Admin section */}
                <div className="px-3 pt-2 border-t border-white/10">
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          location.pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">🔧</span>
                        <span>Panel Admin</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/30 mt-1 transition-all">
                        <span className="text-lg">🚪</span>
                        <span>Cerrar sesión</span>
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-secondary/30 hover:bg-secondary/50 transition-all">
                      <span className="text-lg">🔑</span>
                      <span>Acceder como Admin</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Suspense fallback={<div className="text-center py-12 text-gray-400">Cargando...</div>}>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/personas" element={<ErrorBoundary><People /></ErrorBoundary>} />
              <Route path="/pagos" element={<ErrorBoundary><Payments /></ErrorBoundary>} />
              <Route path="/gastos" element={<ErrorBoundary><Expenses /></ErrorBoundary>} />
              <Route path="/historial" element={<ErrorBoundary><History /></ErrorBoundary>} />
              <Route path="/presupuesto" element={<ErrorBoundary><Budget /></ErrorBoundary>} />
              <Route path="/info" element={<ErrorBoundary><TripInfo /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><Login onLogin={() => setIsAdmin(true)} /></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><Admin isAdmin={isAdmin} /></ErrorBoundary>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}
