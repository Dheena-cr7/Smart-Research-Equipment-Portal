/** StatusBadge — renders a styled badge for equipment and booking statuses */
export default function StatusBadge({ status }) {
  const map = {
    // Equipment statuses
    available:    { label: 'Available',    cls: 'badge-available' },
    booked:       { label: 'Booked',       cls: 'badge-booked' },
    maintenance:  { label: 'Maintenance',  cls: 'badge-maintenance' },
    // Booking statuses
    pending:      { label: 'Pending',      cls: 'badge-pending' },
    confirmed:    { label: 'Confirmed',    cls: 'badge-confirmed' },
    rejected:     { label: 'Rejected',     cls: 'badge-rejected' },
    cancelled:    { label: 'Cancelled',    cls: 'badge-cancelled' },
  }

  const key = status?.toLowerCase()
  const config = map[key] || { label: status, cls: 'badge-cancelled' }

  const dots = {
    available:   'bg-mint-500',
    booked:      'bg-amber-500',
    maintenance: 'bg-red-500',
    pending:     'bg-amber-500',
    confirmed:   'bg-mint-500',
    rejected:    'bg-red-500',
    cancelled:   'bg-slate-400',
  }

  return (
    <span className={config.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[key] || 'bg-slate-400'}`} />
      {config.label}
    </span>
  )
}
