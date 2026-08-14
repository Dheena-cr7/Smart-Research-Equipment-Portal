import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-800 text-white mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight">OptimusPrime</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Smart Research Equipment Portal — Built for smarter research infrastructure.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Platform</h4>
            <nav className="space-y-2.5">
              {[
                { to: '/', label: 'Equipment Catalog' },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Register' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block text-sm text-slate-400 hover:text-mint-400 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">System</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <p>Django 6 · DRF · SQLite</p>
              <p>React · Vite · Tailwind CSS</p>
              <p className="pt-2 text-slate-500 text-xs">
                ICE Workshop 2026<br />
                SKCET CSE Department
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} OptimusPrime — Smart Research Equipment Portal
          </p>
          <p className="text-slate-500 text-xs">Built for smarter research infrastructure.</p>
        </div>
      </div>
    </footer>
  )
}
