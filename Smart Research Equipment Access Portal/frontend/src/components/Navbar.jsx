import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    addToast('Logged out successfully', 'info')
    navigate('/login')
    setMobileOpen(false)
    setProfileOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Equipment', always: true },
    { to: '/my-bookings', label: 'My Bookings', auth: true },
    { to: '/dashboard', label: 'Dashboard', roles: ['faculty', 'admin'] },
  ]

  const visibleLinks = navLinks.filter((l) => {
    if (l.always) return true
    if (l.auth && !isAuthenticated) return false
    if (l.roles && !l.roles.includes(role)) return false
    return true
  })

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bg-white border-b border-slate-100 shadow-nav sticky top-0 z-40">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-navy-800 text-base leading-tight tracking-tight">OptimusPrime</span>
              <span className="hidden sm:block text-[10px] text-slate-400 leading-tight font-medium tracking-wide">SMART RESEARCH PORTAL</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive(l.to)
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                  aria-label="User menu"
                  aria-expanded={profileOpen}
                >
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-800 leading-tight">{user?.username}</p>
                    <p className="text-xs text-slate-400 capitalize leading-tight">{role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-50">
                        <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
                        <p className="text-xs text-slate-400 capitalize">{role} Account</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Log In</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in">
          <div className="page-container py-4 space-y-1">
            {visibleLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive(l.to)
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 mt-3">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
                    <p className="text-xs text-slate-400 capitalize">{role} Account</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
