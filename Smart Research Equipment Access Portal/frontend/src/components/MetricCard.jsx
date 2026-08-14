/** MetricCard — dashboard KPI cards */
export default function MetricCard({ title, value, subtitle, icon, color = 'teal' }) {
  const colorMap = {
    teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100 text-teal-600',  text: 'text-teal-600' },
    mint:   { bg: 'bg-mint-50',   icon: 'bg-mint-100 text-mint-700',   text: 'text-mint-600' },
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',     text: 'text-red-600' },
    navy:   { bg: 'bg-navy-50',   icon: 'bg-navy-100 text-navy-600',   text: 'text-navy-600' },
  }
  const c = colorMap[color] || colorMap.teal

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 mb-1.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
