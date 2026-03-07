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
    <div className="app-container">
      <Navbar user={user} onLogout={onLogout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="d-flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <main 
          className="flex-grow-1 p-3" 
          style={{ 
            marginLeft: isDesktop && sidebarOpen ? '250px' : '0',
            transition: 'margin-left 0.3s ease',
            width: '100%'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
