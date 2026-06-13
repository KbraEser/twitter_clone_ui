import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated } from '../store/authSlice'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
