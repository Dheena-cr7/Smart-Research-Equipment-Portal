import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Redirect users without the required role */
export default function RoleGuard({ allowedRoles, children, redirectTo = '/' }) {
  const { role, loading } = useAuth()

  if (loading) return null

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
