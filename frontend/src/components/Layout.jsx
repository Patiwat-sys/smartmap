import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992)
      if (window.innerWidth >= 992) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    if (window.innerWidth >= 992) {
      setSidebarOpen(true)
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="app-container" style={{ background: '#FAFBFC', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="d-flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <main 
          className="flex-grow-1" 
          style={{ 
            marginLeft: isDesktop && sidebarOpen ? '280px' : '0',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%',
            padding: '32px',
            minHeight: 'calc(100vh - 80px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
