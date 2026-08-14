import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { equipmentService } from '../services/equipment'
import { bookingService } from '../services/bookings'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

// Returns minimum datetime string (now, rounded to next 15 min)
function minDateTime() {
  const d = new Date()
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  return d.toISOString().slice(0, 16)
}

export default function EquipmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()

  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Booking form
  const [form, setForm] = useState({ start_time: '', end_time: '', purpose: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    equipmentService.getById(id)
      .then((res) => setEquipment(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setError('Equipment not found.')
        else setError('Unable to load equipment details.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setFormErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.start_time) errs.start_time = 'Start time is required.'
    if (!form.end_time) errs.end_time = 'End time is required.'
    if (form.start_time && form.end_time && form.start_time >= form.end_time)
      errs.end_time = 'End time must be after start time.'
    if (!form.purpose.trim()) errs.purpose = 'Purpose is required.'
    return errs
  }

  const handleOpenConfirm = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setConfirmOpen(true)
  }

  const handleSubmit = async () => {
    setConfirmOpen(false)
    setSubmitting(true)
    try {
      await bookingService.create({
        equipment: id,
        start_time: form.start_time,
        end_time: form.end_time,
        purpose: form.purpose,
      })
      if (equipment.requires_approval) {
        addToast('Booking submitted for faculty approval.', 'info')
      } else {
        addToast('Booking confirmed! Your slot is reserved.', 'success')
      }
      navigate('/my-bookings')
    } catch (err) {
      if (err.response?.status === 409) {
        addToast('This time slot is already booked. Please choose a different time.', 'error')
        setFormErrors({ end_time: 'This slot conflicts with an existing confirmed booking.' })
      } else if (err.response?.status === 401) {
        addToast('Your session has expired. Please log in again.', 'error')
        navigate('/login')
      } else {
        const msg = err.response?.data?.detail || err.response?.data?.error || 'Booking failed. Please try again.'
        addToast(msg, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container py-12">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-64 rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
            <div className="skeleton h-96 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
        <Link to="/" className="btn-primary">Back to Equipment</Link>
      </div>
    )
  }

  const { name, lab, department, status, description, requires_approval } = equipment

  // For booking summary display
  const formatDT = (val) => val ? new Date(val).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

  return (
    <div className="py-8">
      <div className="page-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-teal-600 transition-colors">Equipment</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-800 font-medium truncate max-w-xs">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Equipment Info ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual */}
            <div className={`h-56 rounded-2xl flex items-center justify-center ${
              status === 'available' ? 'bg-teal-50' :
              status === 'booked' ? 'bg-amber-50' : 'bg-red-50'
            }`}>
              <svg className="w-20 h-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.075m.75-.075a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.075M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.414c-1.444 0-2.414-1.798-1.414-2.798L4.6 15.3" />
              </svg>
            </div>

            {/* Name + Status */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <StatusBadge status={status} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Laboratory', value: lab, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                { label: 'Department', value: department, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              ].map((info) => (
                <div key={info.label} className="card p-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={info.icon} />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wide">{info.label}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Access Level */}
            {requires_approval && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Faculty Approval Required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your booking will be submitted as a pending request and must be approved by a faculty member before it is confirmed.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Description</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
              </div>
            )}
          </div>

          {/* ── Right: Booking Form ─────────────────────────────────── */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Request Booking</h2>
              <p className="text-sm text-slate-500 mb-5">
                {requires_approval ? 'Submit a request for faculty approval.' : 'Select a time slot to reserve this equipment.'}
              </p>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-4">You must be logged in to book equipment.</p>
                  <Link to={`/login`} className="btn-primary w-full justify-center">Sign In to Book</Link>
                  <Link to="/register" className="btn-secondary w-full justify-center mt-2">Create Account</Link>
                </div>
              ) : status !== 'available' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {status === 'booked' ? 'This equipment is currently booked.' : 'This equipment is under maintenance.'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Check back later for availability.</p>
                </div>
              ) : (
                <form onSubmit={handleOpenConfirm} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="start_time" className="label">Start Date & Time</label>
                    <input
                      id="start_time" name="start_time" type="datetime-local"
                      value={form.start_time} onChange={handleChange}
                      min={minDateTime()} disabled={submitting}
                      className={`input-field ${formErrors.start_time ? 'border-red-400' : ''}`}
                    />
                    {formErrors.start_time && <p className="text-xs text-red-600 mt-1">{formErrors.start_time}</p>}
                  </div>

                  <div>
                    <label htmlFor="end_time" className="label">End Date & Time</label>
                    <input
                      id="end_time" name="end_time" type="datetime-local"
                      value={form.end_time} onChange={handleChange}
                      min={form.start_time || minDateTime()} disabled={submitting}
                      className={`input-field ${formErrors.end_time ? 'border-red-400' : ''}`}
                    />
                    {formErrors.end_time && <p className="text-xs text-red-600 mt-1">{formErrors.end_time}</p>}
                  </div>

                  <div>
                    <label htmlFor="purpose" className="label">Purpose</label>
                    <textarea
                      id="purpose" name="purpose" rows={3}
                      value={form.purpose} onChange={handleChange} disabled={submitting}
                      className={`input-field resize-none ${formErrors.purpose ? 'border-red-400' : ''}`}
                      placeholder="Briefly describe your research purpose…"
                    />
                    {formErrors.purpose && <p className="text-xs text-red-600 mt-1">{formErrors.purpose}</p>}
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                    {submitting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                    ) : requires_approval ? 'Submit Booking Request' : 'Confirm Booking'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Your Booking"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary">
              {requires_approval ? 'Submit Request' : 'Confirm Booking'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Equipment</span>
            <span className="font-semibold text-slate-800 text-right max-w-[60%]">{name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Start</span>
            <span className="font-medium text-slate-800">{formatDT(form.start_time)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">End</span>
            <span className="font-medium text-slate-800">{formatDT(form.end_time)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Purpose</span>
            <span className="font-medium text-slate-800 text-right max-w-[60%] line-clamp-2">{form.purpose}</span>
          </div>
          {requires_approval && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-700">This equipment requires faculty approval. Your booking will be pending until approved.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
