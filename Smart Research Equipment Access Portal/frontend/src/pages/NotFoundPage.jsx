import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-100 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Page not found</h1>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Back to Equipment</Link>
          <Link to="/my-bookings" className="btn-secondary">My Bookings</Link>
        </div>
      </div>
    </div>
  )
}
