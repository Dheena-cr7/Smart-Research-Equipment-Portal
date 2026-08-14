/** Skeleton loading placeholder */
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4 animate-pulse">
      <div className="skeleton h-40 w-full rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: `${60 + (i * 8) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonMetric() {
  return (
    <div className="card p-6 animate-pulse space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-8 w-16 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  )
}
