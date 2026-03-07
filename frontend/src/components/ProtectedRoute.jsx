import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, isAuthenticated, requiredRole = null }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== requiredRole) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
