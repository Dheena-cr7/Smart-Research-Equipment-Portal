/** EmptyState — polished empty state with icon and CTA */
export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary text-sm px-5 py-2.5"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
