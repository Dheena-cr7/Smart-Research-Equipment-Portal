import { useState, useEffect, useCallback } from 'react'
import { bookingService } from '../services/bookings'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import { SkeletonRow } from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { Link } from 'react-router-dom'

const fmt = (dt) =>
  dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

function BookingRow({ booking, onCancel }) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const { equipment_details, start_time, end_time, purpose, status, created_at } = booking

  const canCancel = ['pending', 'confirmed'].includes(status)

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-4 py-4 text-sm font-medium text-slate-900">
          <Link to={`/equipment/${booking.equipment}`} className="hover:text-teal-600 transition-colors">
            {equipment_details?.name || `Equipment #${booking.equipment}`}
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">{equipment_details?.lab}</p>
        </td>
        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
          {fmt(start_time)}
        </td>
        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
          {fmt(end_time)}
        </td>
        <td className="px-4 py-4 text-sm text-slate-500 max-w-xs">
          <span className="line-clamp-2">{purpose}</span>
        </td>
        <td className="px-4 py-4">
          <StatusBadge status={status} />
        </td>
        <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">
          {fmt(created_at)}
        </td>
        <td className="px-4 py-4">
          {canCancel && (
            <button
              onClick={() => setCancelOpen(true)}
              className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors hover:underline"
            >
              Cancel
            </button>
          )}
        </td>
      </tr>

      {/* Mobile card — hidden on desktop */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Booking"
        footer={
          <>
            <button onClick={() => setCancelOpen(false)} className="btn-secondary">Keep Booking</button>
            <button onClick={() => { onCancel(booking.id); setCancelOpen(false) }} className="btn-danger">
              Yes, Cancel
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to cancel your booking for{' '}
          <span className="font-semibold text-slate-800">{equipment_details?.name}</span> on{' '}
          <span className="font-semibold">{fmt(start_time)}</span>?
        </p>
        <p className="text-xs text-slate-400 mt-2">This action cannot be undone.</p>
      </Modal>
    </>
  )
}

function BookingMobileCard({ booking, onCancel }) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const { equipment_details, start_time, end_time, purpose, status } = booking
  const canCancel = ['pending', 'confirmed'].includes(status)

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900 text-sm">
            {equipment_details?.name || `Equipment #${booking.equipment}`}
          </p>
          <p className="text-xs text-slate-400">{equipment_details?.lab}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <p className="text-slate-400 font-medium mb-0.5">Start</p>
          <p>{fmt(start_time)}</p>
        </div>
        <div>
          <p className="text-slate-400 font-medium mb-0.5">End</p>
          <p>{fmt(end_time)}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2">{purpose}</p>
      {canCancel && (
        <>
          <button onClick={() => setCancelOpen(true)} className="text-xs text-red-600 font-medium hover:underline">
            Cancel Booking
          </button>
          <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Booking"
            footer={
              <>
                <button onClick={() => setCancelOpen(false)} className="btn-secondary">Keep</button>
                <button onClick={() => { onCancel(booking.id); setCancelOpen(false) }} className="btn-danger">Cancel</button>
              </>
            }
          >
            <p className="text-sm text-slate-600">Cancel your booking for <span className="font-semibold">{equipment_details?.name}</span>?</p>
          </Modal>
        </>
      )}
    </div>
  )
}

export default function MyBookingsPage() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingService.getAll()
      setBookings(res.data.results ?? res.data)
    } catch {
      setError('Unable to load your bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleCancel = async (id) => {
    try {
      await bookingService.cancel(id)
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)
      )
      addToast('Booking cancelled successfully.', 'info')
    } catch {
      addToast('Failed to cancel booking. Please try again.', 'error')
    }
  }

  return (
    <div className="py-8">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">My Bookings</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link to="/" className="btn-primary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Book Equipment
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block card overflow-hidden">
          <table className="w-full" aria-label="My bookings">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Equipment', 'Start', 'End', 'Purpose', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      }
                      title="No bookings yet"
                      message="You haven't made any bookings. Explore the equipment catalog to get started."
                      action={{ label: 'Explore Equipment', onClick: () => window.location.href = '/' }}
                    />
                  </td>
                </tr>
              ) : (
                bookings.map((b) => <BookingRow key={b.id} booking={b} onCancel={handleCancel} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 space-y-3 animate-pulse">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            ))
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="No bookings yet"
              message="Explore the equipment catalog to make your first booking."
              action={{ label: 'Explore Equipment', onClick: () => window.location.href = '/' }}
            />
          ) : (
            bookings.map((b) => <BookingMobileCard key={b.id} booking={b} onCancel={handleCancel} />)
          )}
        </div>
      </div>
    </div>
  )
}
