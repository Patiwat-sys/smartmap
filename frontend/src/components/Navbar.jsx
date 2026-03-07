import { Link } from 'react-router-dom'

function Navbar({ user, onLogout, onMenuClick }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <button
          className="navbar-toggler me-3"
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <Link className="navbar-brand fw-bold" to="/">
          🗺️ Smart Map
        </Link>
        
        <div className="navbar-nav ms-auto align-items-center">
          <span className="navbar-text text-white me-3 d-none d-md-inline">
            Welcome, {user?.username || 'User'}
          </span>
          {user?.role === 'Admin' && (
            <Link className="nav-link text-white me-2" to="/admin">
              Admin
            </Link>
          )}
          <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
