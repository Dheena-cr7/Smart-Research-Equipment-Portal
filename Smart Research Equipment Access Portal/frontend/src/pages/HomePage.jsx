import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { equipmentService } from '../services/equipment'
import { bookingService } from '../services/bookings'
import { useAuth } from '../context/AuthContext'
import EquipmentCard from '../components/EquipmentCard'
import { SkeletonCard } from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

const DEPARTMENTS = [
  'All Departments',
  'Chemical Engineering',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Materials Science',
  'Mechanical Engineering',
]

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'maintenance', label: 'Maintenance' },
]

function StatCard({ value, label, color }) {
  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-white/70 mt-1">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState({ total: 0, available: 0, booked: 0, maintenance: 0 })

  const fetchEquipment = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search) params.search = search
      if (deptFilter) params.department = deptFilter
      if (statusFilter) params.status = statusFilter
      const res = await equipmentService.getAll(params)
      const data = res.data.results ?? res.data
      setEquipment(data)
    } catch {
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [search, deptFilter, statusFilter])

  // Fetch all for stats (once)
  useEffect(() => {
    equipmentService.getAll().then((res) => {
      const all = res.data.results ?? res.data
      setStats({
        total: all.length,
        available: all.filter((e) => e.status === 'available').length,
        booked: all.filter((e) => e.status === 'booked').length,
        maintenance: all.filter((e) => e.status === 'maintenance').length,
      })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchEquipment, 300)
    return () => clearTimeout(timer)
  }, [fetchEquipment])

  const clearFilters = () => {
    setSearch('')
    setDeptFilter('')
    setStatusFilter('')
  }
  const hasFilters = search || deptFilter || statusFilter

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-navy-800 text-white">
        <div className="page-container py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-mint-400 rounded-full animate-pulse-slow" />
              <span className="text-sm font-medium text-teal-300">SKCET Research Infrastructure</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Research Smarter.{' '}
              <span className="text-mint-400">Book Equipment</span>{' '}
              Faster.
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl leading-relaxed">
              Discover, schedule, and manage access to advanced research equipment across your campus laboratories. Professional-grade instruments, one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#catalog" className="btn-primary text-base px-7 py-3">
                Explore Equipment
              </a>
              {isAuthenticated ? (
                <Link to="/my-bookings" className="inline-flex items-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-lg transition-all border border-white/20">
                  View My Bookings
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-lg transition-all border border-white/20">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-white/10 bg-white/5">
          <div className="page-container py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
              <StatCard value={stats.total} label="Research Equipment" color="text-mint-400" />
              <div className="md:pl-8"><StatCard value={stats.available} label="Available Now" color="text-mint-400" /></div>
              <div className="md:pl-8"><StatCard value={stats.booked} label="Currently Booked" color="text-amber-400" /></div>
              <div className="md:pl-8"><StatCard value={stats.maintenance} label="In Maintenance" color="text-red-400" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog ──────────────────────────────────────────────────────── */}
      <section id="catalog" className="py-12">
        <div className="page-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="section-title">Equipment Catalog</h2>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Loading…' : `${equipment.length} item${equipment.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="Search equipment, laboratory, or department…"
                aria-label="Search equipment"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field sm:w-44"
              aria-label="Filter by status"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {/* Department filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value === 'All Departments' ? '' : e.target.value)}
              className="input-field sm:w-56"
              aria-label="Filter by department"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d === 'All Departments' ? '' : d}>{d}</option>)}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost text-sm whitespace-nowrap">
                Clear filters
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : equipment.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No equipment found"
              message="Try another search term or change your filters."
              action={hasFilters ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((eq) => (
                <div key={eq.id} className="fade-enter">
                  <EquipmentCard equipment={eq} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
