import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      onLogin(response.data.user, response.data.token)
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:5000')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
        padding: '20px'
      }}
    >
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          padding: '48px 40px',
          borderRadius: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="text-center mb-5">
          <div 
            style={{ 
              fontSize: '3rem', 
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          >
            🗺️
          </div>
          <h2 className="fw-bold mb-2" style={{ color: '#2E5C8A', fontSize: '2rem' }}>
            Smart Map
          </h2>
          <p className="text-muted" style={{ fontSize: '0.95rem', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div 
            className="alert alert-danger" 
            role="alert"
            style={{ 
              borderRadius: '16px',
              marginBottom: '24px',
              fontSize: '0.9rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="form-label">
              Username or Email
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username or email"
              style={{ borderRadius: '16px', fontSize: '0.95rem' }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              style={{ borderRadius: '16px', fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ 
              borderRadius: '16px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: '8px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <small className="text-muted" style={{ fontSize: '0.85rem' }}>
            Demo accounts: <strong>admin/admin123</strong> or <strong>user/user123</strong>
          </small>
        </div>
      </div>
    </div>
  )
}

export default Login
