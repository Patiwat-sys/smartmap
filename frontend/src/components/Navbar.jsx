import { Link } from 'react-router-dom'

function Navbar({ user, onLogout, onMenuClick }) {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid px-4">
        <button
          className="navbar-toggler me-3"
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
          style={{ 
            borderRadius: '12px',
            padding: '8px 12px',
            border: '2px solid #E5E7EB'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <Link 
          className="navbar-brand fw-bold" 
          to="/"
          style={{ 
            fontSize: '1.5rem',
            textDecoration: 'none'
          }}
        >
          🗺️ Smart Map
        </Link>
        
        <div className="navbar-nav ms-auto align-items-center">
          <span 
            className="navbar-text me-4 d-none d-md-inline"
            style={{ 
              color: '#6B7280',
              fontWeight: '500'
            }}
          >
            Welcome, <strong>{user?.username || 'User'}</strong>
          </span>
          {user?.role === 'Admin' && (
            <Link 
              className="nav-link me-3" 
              to="/admin"
              style={{ 
                borderRadius: '12px',
                padding: '8px 16px'
              }}
            >
              Admin
            </Link>
          )}
          <button 
            className="btn btn-outline-primary btn-sm" 
            onClick={onLogout}
            style={{ 
              borderRadius: '12px',
              border: '2px solid #6BB6FF',
              color: '#6BB6FF',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
