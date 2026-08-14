import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const ROLES = [
  {
    value: 'student',
    label: 'Student',
    desc: 'Browse equipment and manage your bookings.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    value: 'faculty',
    label: 'Faculty',
    desc: 'Review and approve restricted equipment requests.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    value: 'admin',
    label: 'Admin',
    desc: 'Manage equipment and system resources.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'student', department: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form)
      addToast('Account created successfully! Welcome to OptimusPrime.', 'success')
      navigate('/')
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      Object.entries(data).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : v
      })
      setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-700 to-teal-600 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">OptimusPrime</h1>
              <p className="text-sm text-white/60 font-medium tracking-wide">SMART RESEARCH PORTAL</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500 mt-1">Join the research equipment portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-username" className="label">Username</label>
                <input id="reg-username" name="username" type="text" autoComplete="username"
                  value={form.username} onChange={handleChange} disabled={loading}
                  className={`input-field ${errors.username ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Choose a username" />
                {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className="label">Email</label>
                <input id="reg-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} disabled={loading}
                  className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="your@email.com" />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <input id="reg-password" name="password" type="password" autoComplete="new-password"
                value={form.password} onChange={handleChange} disabled={loading}
                className={`input-field ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="Minimum 6 characters" />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="reg-department" className="label">Department <span className="text-slate-400 font-normal">(optional)</span></label>
              <input id="reg-department" name="department" type="text"
                value={form.department} onChange={handleChange} disabled={loading}
                className="input-field" placeholder="e.g. Computer Science & Engineering" />
            </div>

            {/* Role Selector */}
            <div>
              <p className="label">Select your role</p>
              <div className="grid grid-cols-1 gap-2.5">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      form.role === r.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                      onChange={handleChange} className="sr-only" />
                    <span className={`mt-0.5 ${form.role === r.value ? 'text-teal-600' : 'text-slate-400'}`}>
                      {r.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${form.role === r.value ? 'text-teal-700' : 'text-slate-800'}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                    {form.role === r.value && (
                      <svg className="w-5 h-5 text-teal-500 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {errors.non_field_errors && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{errors.non_field_errors}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
