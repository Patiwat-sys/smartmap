import { Link, useLocation } from 'react-router-dom'

function Sidebar({ isOpen, onClose, user }) {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: '🗺️', label: 'Map', roles: ['User', 'Admin'] },
    { path: '/verify-seams', icon: '🔍', label: 'Verify Seam', roles: ['Admin'] },
    { path: '/monthly-maps', icon: '📅', label: 'Monthly Maps', roles: ['Admin'] },
    { path: '/geophysic', icon: '📄', label: 'Geophysic', roles: ['Admin'] },
    { path: '/activity-logs', icon: '📊', label: 'Activity Logs', roles: ['Admin'] },
    { path: '/admin', icon: '⚙️', label: 'Admin Dashboard', roles: ['Admin'] },
  ]

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'User')
  )

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        ></div>
      )}
      <div 
        className={`sidebar ${isOpen ? 'open' : ''}`} 
        style={{
          position: 'fixed',
          left: isOpen ? '0' : '-280px',
          top: '80px',
          width: '280px',
          zIndex: 1000,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '32px 0',
          borderRadius: '0 24px 24px 0'
        }}
      >
        <div className="px-4">
          <h5 
            className="text-dark mb-4 px-3" 
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#6B7280'
            }}
          >
            Menu
          </h5>
          <nav className="nav flex-column">
            {filteredItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link d-flex align-items-center px-4 py-3 mb-2 ${
                  location.pathname === item.path 
                    ? 'active' 
                    : ''
                }`}
                onClick={onClose}
                style={{
                  borderRadius: '16px',
                  margin: '0 12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: location.pathname === item.path 
                    ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' 
                    : 'transparent',
                  background: location.pathname === item.path 
                    ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' 
                    : 'transparent',
                  color: location.pathname === item.path 
                    ? '#2E5C8A' 
                    : '#1A1A1A',
                  fontWeight: location.pathname === item.path ? '600' : '500',
                  boxShadow: location.pathname === item.path 
                    ? '0 4px 12px rgba(107, 182, 255, 0.2)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = '#F5FAFF'
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                <span 
                  className="me-3" 
                  style={{ 
                    fontSize: '1.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <style>{`
        @media (min-width: 992px) {
          .sidebar {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar
