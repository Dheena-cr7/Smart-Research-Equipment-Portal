import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

// Equipment category icon mapping
const categoryIcons = {
  spectrometer: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.075m.75-.075a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.075M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.414c-1.444 0-2.414-1.798-1.414-2.798L4.6 15.3" />
    </svg>
  ),
  microscope: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
  ),
  mechanical: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  computing: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
    </svg>
  ),
  electronics: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  manufacturing: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
    </svg>
  ),
  default: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
}

function getIcon(name = '') {
  const n = name.toLowerCase()
  if (n.includes('spectrometer') || n.includes('ftir') || n.includes('xrd') || n.includes('thermal')) return categoryIcons.spectrometer
  if (n.includes('microscope') || n.includes('sem') || n.includes('camera')) return categoryIcons.microscope
  if (n.includes('instron') || n.includes('testing') || n.includes('milling') || n.includes('cnc')) return categoryIcons.mechanical
  if (n.includes('gpu') || n.includes('workstation') || n.includes('embedded') || n.includes('computer')) return categoryIcons.computing
  if (n.includes('oscilloscope') || n.includes('laser') || n.includes('electronic')) return categoryIcons.electronics
  if (n.includes('printer') || n.includes('3d') || n.includes('manufactur')) return categoryIcons.manufacturing
  return categoryIcons.default
}

const bgColors = {
  available:   'bg-teal-50 text-teal-600',
  booked:      'bg-amber-50 text-amber-600',
  maintenance: 'bg-red-50 text-red-600',
}

export default function EquipmentCard({ equipment }) {
  const navigate = useNavigate()
  const { id, name, lab, department, status, requires_approval, description } = equipment
  const icon = getIcon(name)
  const iconBg = bgColors[status?.toLowerCase()] || bgColors.available

  return (
    <div className="card-hover flex flex-col h-full overflow-hidden">
      {/* Visual Header */}
      <div className={`h-36 flex items-center justify-center ${iconBg} relative`}>
        {icon}
        {requires_approval && (
          <span className="absolute top-3 right-3 bg-white/90 text-amber-700 text-[10px] font-semibold px-2 py-1 rounded-full border border-amber-200">
            Approval Required
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1 line-clamp-2">{name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{lab}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{department}</span>
          </div>
        </div>

        {description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">{description}</p>
        )}

        <div className="mt-auto space-y-3">
          <StatusBadge status={status} />
          <div className="flex gap-2 pt-1">
            <Link
              to={`/equipment/${id}`}
              className="btn-secondary flex-1 justify-center text-xs py-2"
            >
              View Details
            </Link>
            {status?.toLowerCase() === 'available' && (
              <Link
                to={`/equipment/${id}`}
                className="btn-primary flex-1 justify-center text-xs py-2"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
