import { useState, useEffect, useCallback } from 'react'
import { bookingService } from '../services/bookings'
import { equipmentService } from '../services/equipment'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import { SkeletonMetric, SkeletonRow } from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

const fmt = (dt) =>
  dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

function PendingBookingRow({ booking, onApprove, onReject, processing }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-slate-900">{booking.user?.username}</div>
        <div className="text-xs text-slate-400 capitalize">{booking.user?.role}</div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-slate-900">
          {booking.equipment_details?.name || `#${booking.equipment}`}
        </div>
        <div className="text-xs text-slate-400">{booking.equipment_details?.lab}</div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{fmt(booking.start_time)}</td>
      <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{fmt(booking.end_time)}</td>
      <td className="px-4 py-4 text-sm text-slate-500 max-w-xs">
        <span className="line-clamp-2">{booking.purpose}</span>
      </td>
      <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApprove(booking.id)}
            disabled={processing === booking.id}
            className="text-xs bg-mint-50 text-mint-700 hover:bg-mint-100 border border-mint-200 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(booking.id)}
            disabled={processing === booking.id}
            className="text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </td>
    </tr>
  )
}

function AddEquipmentModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', lab: '', department: '', status: 'available',
    requires_approval: false, description: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [e.target.name]: val }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.lab.trim()) errs.lab = 'Lab is required.'
    if (!form.department.trim()) errs.department = 'Department is required.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave(form)
      setForm({ name: '', lab: '', department: '', status: 'available', requires_approval: false, description: '' })
      onClose()
    } catch (err) {
      const data = err.response?.data || {}
      const mapped = {}
      Object.entries(data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
      setErrors(mapped)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Equipment"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button form="add-equipment-form" type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Adding…' : 'Add Equipment'}
          </button>
        </>
      }
    >
      <form id="add-equipment-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Equipment Name</label>
          <input name="name" className={`input-field ${errors.name ? 'border-red-400' : ''}`}
            value={form.name} onChange={handleChange} placeholder="e.g. FTIR Spectrometer" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Laboratory</label>
            <input name="lab" className={`input-field ${errors.lab ? 'border-red-400' : ''}`}
              value={form.lab} onChange={handleChange} placeholder="Lab name" />
            {errors.lab && <p className="text-xs text-red-600 mt-1">{errors.lab}</p>}
          </div>
          <div>
            <label className="label">Department</label>
            <input name="department" className={`input-field ${errors.department ? 'border-red-400' : ''}`}
              value={form.department} onChange={handleChange} placeholder="Dept. name" />
            {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department}</p>}
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" className="input-field" value={form.status} onChange={handleChange}>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={3} className="input-field resize-none"
            value={form.description} onChange={handleChange} placeholder="Equipment description…" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="requires_approval" checked={form.requires_approval} onChange={handleChange}
            className="w-4 h-4 text-teal-600 rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700">Requires faculty approval to book</span>
        </label>
      </form>
    </Modal>
  )
}

export default function DashboardPage() {
  const { role } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [pendingBookings, setPendingBookings] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [addEquipOpen, setAddEquipOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // equipment object

  const fetchStats = useCallback(async () => {
    try {
      const res = await bookingService.getDashboardStats()
      setStats(res.data)
    } catch { /* handled by auth interceptor */ }
    finally { setLoadingStats(false) }
  }, [])

  const fetchPending = useCallback(async () => {
    setLoadingPending(true)
    try {
      const res = await bookingService.getAll({ status: 'pending' })
      setPendingBookings(res.data.results ?? res.data)
    } catch { }
    finally { setLoadingPending(false) }
  }, [])

  const fetchEquipment = useCallback(async () => {
    try {
      const res = await equipmentService.getAll()
      setEquipment(res.data.results ?? res.data)
    } catch { }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchPending()
    if (role === 'admin') fetchEquipment()
  }, [fetchStats, fetchPending, fetchEquipment, role])

  const handleApprove = async (id) => {
    setProcessing(id)
    try {
      await bookingService.approve(id)
      setPendingBookings((prev) => prev.filter((b) => b.id !== id))
      setStats((s) => s ? { ...s, pending_approvals: s.pending_approvals - 1, active_bookings: s.active_bookings + 1 } : s)
      addToast('Booking approved and confirmed.', 'success')
    } catch { addToast('Failed to approve booking.', 'error') }
    finally { setProcessing(null) }
  }

  const handleReject = async (id) => {
    setProcessing(id)
    try {
      await bookingService.reject(id)
      setPendingBookings((prev) => prev.filter((b) => b.id !== id))
      setStats((s) => s ? { ...s, pending_approvals: s.pending_approvals - 1 } : s)
      addToast('Booking rejected.', 'info')
    } catch { addToast('Failed to reject booking.', 'error') }
    finally { setProcessing(null) }
  }

  const handleAddEquipment = async (data) => {
    const res = await equipmentService.create(data)
    setEquipment((prev) => [...prev, res.data])
    setStats((s) => s ? { ...s, total_equipment: s.total_equipment + 1 } : s)
    addToast('Equipment added to the catalog.', 'success')
  }

  const handleDeleteEquipment = async (eq) => {
    try {
      await equipmentService.delete(eq.id)
      setEquipment((prev) => prev.filter((e) => e.id !== eq.id))
      setStats((s) => s ? { ...s, total_equipment: s.total_equipment - 1 } : s)
      addToast('Equipment deleted.', 'info')
    } catch { addToast('Failed to delete equipment.', 'error') }
    finally { setDeleteConfirm(null) }
  }

  const metrics = stats ? [
    { title: 'Total Equipment', value: stats.total_equipment, subtitle: 'In the catalog', color: 'navy',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
    { title: 'Available Now', value: stats.available_now, subtitle: 'Ready to book', color: 'mint',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: 'Active Bookings', value: stats.active_bookings, subtitle: 'Confirmed slots', color: 'teal',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { title: 'Pending Approvals', value: stats.pending_approvals, subtitle: 'Awaiting review', color: 'amber',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ] : []

  return (
    <div className="py-8">
      <div className="page-container space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 capitalize">{role} Overview</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/" className="btn-secondary text-sm">View Equipment</Link>
            {role === 'admin' && (
              <button onClick={() => setAddEquipOpen(true)} className="btn-primary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </button>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingStats
            ? [...Array(4)].map((_, i) => <SkeletonMetric key={i} />)
            : metrics.map((m) => <MetricCard key={m.title} {...m} />)
          }
        </div>

        {/* Pending Approvals Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Pending Approvals
              {pendingBookings.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {pendingBookings.length}
                </span>
              )}
            </h2>
          </div>

          <div className="card overflow-hidden">
            {loadingPending ? (
              <div className="p-6 space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
              </div>
            ) : pendingBookings.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="All caught up!"
                message="There are no pending approvals at the moment."
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full" aria-label="Pending approvals">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {['User', 'Equipment', 'Start', 'End', 'Purpose', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pendingBookings.map((b) => (
                        <PendingBookingRow key={b.id} booking={b} onApprove={handleApprove} onReject={handleReject} processing={processing} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-50">
                  {pendingBookings.map((b) => (
                    <div key={b.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{b.equipment_details?.name}</p>
                          <p className="text-xs text-slate-400">by {b.user?.username} · {fmt(b.start_time)}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{b.purpose}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(b.id)} disabled={processing === b.id}
                          className="flex-1 text-xs bg-mint-50 text-mint-700 border border-mint-200 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
                          Approve
                        </button>
                        <button onClick={() => handleReject(b.id)} disabled={processing === b.id}
                          className="flex-1 text-xs bg-red-50 text-red-700 border border-red-200 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin Equipment Management */}
        {role === 'admin' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Equipment Management</h2>
              <button onClick={() => setAddEquipOpen(true)} className="btn-primary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </button>
            </div>
            <div className="card overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full" aria-label="Equipment management">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Name', 'Lab', 'Department', 'Status', 'Approval', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {equipment.map((eq) => (
                      <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-xs">
                          <Link to={`/equipment/${eq.id}`} className="hover:text-teal-600 transition-colors line-clamp-1">{eq.name}</Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{eq.lab}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{eq.department}</td>
                        <td className="px-4 py-3"><StatusBadge status={eq.status} /></td>
                        <td className="px-4 py-3 text-sm text-slate-500">{eq.requires_approval ? 'Required' : 'Not required'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDeleteConfirm(eq)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-slate-50">
                {equipment.map((eq) => (
                  <div key={eq.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{eq.name}</p>
                      <p className="text-xs text-slate-400">{eq.lab}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={eq.status} />
                      <button onClick={() => setDeleteConfirm(eq)} className="text-xs text-red-600 font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {stats?.recent_bookings?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Booking Activity</h2>
            <div className="card overflow-hidden">
              <div className="divide-y divide-slate-50">
                {stats.recent_bookings.slice(0, 8).map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{b.equipment_details?.name}</p>
                      <p className="text-xs text-slate-400">by {b.user?.username} · {fmt(b.created_at)}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AddEquipmentModal isOpen={addEquipOpen} onClose={() => setAddEquipOpen(false)} onSave={handleAddEquipment} />

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Equipment"
        footer={
          <>
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => handleDeleteEquipment(deleteConfirm)} className="btn-danger">Delete</button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">{deleteConfirm?.name}</span>?
          This will also remove all associated bookings.
        </p>
      </Modal>
    </div>
  )
}
