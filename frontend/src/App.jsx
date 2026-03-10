import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import MapPage from './pages/MapPage'
import VerifySeamPage from './pages/VerifySeamPage'
import MonthlyMapsPage from './pages/MonthlyMapsPage'
import GeophysicPage from './pages/GeophysicPage'
import ActivityLogsPage from './pages/ActivityLogsPage'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Login onLogin={handleLogin} />
        } 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout user={user} onLogout={handleLogout}>
              <MapPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-seams"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin">
            <Layout user={user} onLogout={handleLogout}>
              <VerifySeamPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monthly-maps"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin">
            <Layout user={user} onLogout={handleLogout}>
              <MonthlyMapsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/geophysic"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin">
            <Layout user={user} onLogout={handleLogout}>
              <GeophysicPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity-logs"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin">
            <Layout user={user} onLogout={handleLogout}>
              <ActivityLogsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="Admin">
            <Layout user={user} onLogout={handleLogout}>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
