import { Link, useLocation } from 'react-router-dom'

function Sidebar({ isOpen, onClose, user }) {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: '🗺️', label: 'Map', roles: ['User', 'Admin'] },
    { path: '/admin', icon: '⚙️', label: 'Admin Dashboard', roles: ['Admin'] },
  ]

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'User')
  )

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        left: isOpen ? '0' : '-250px',
        top: '56px',
        width: '250px',
        zIndex: 1000,
        transition: 'left 0.3s ease',
        padding: '20px 0'
      }}>
        <div className="px-3">
          <h5 className="text-dark mb-4 px-3">Menu</h5>
          <nav className="nav flex-column">
            {filteredItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link d-flex align-items-center px-3 py-2 mb-1 ${
                  location.pathname === item.path ? 'active bg-white text-primary' : 'text-dark'
                }`}
                onClick={onClose}
                style={{
                  borderRadius: '8px',
                  margin: '0 10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span className="me-2" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <style>{`
        .sidebar-overlay {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        @media (min-width: 992px) {
          .sidebar {
            position: relative !important;
            left: 0 !important;
          }
          .sidebar-overlay {
            display: none;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar
