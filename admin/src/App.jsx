import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark')
  const [initialLoading, setInitialLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('adminTheme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setInitialLoading(false), 500)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (t) => {
    localStorage.setItem('adminToken', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
  }

  return (
    <>
      {initialLoading && (
        <div className={`global-loading-screen ${fadeOut ? 'fade-out' : ''}`}>
          <img src="/pikachuchay.gif" alt="Loading" className="loading-icon" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
          <div className="loading-text">Đang tải hệ thống...</div>
        </div>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1e1e3a' : '#fff',
            color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
            border: `1px solid ${theme === 'dark' ? 'rgba(99,102,241,0.3)' : '#e2e8f0'}`,
            fontFamily: 'Outfit, sans-serif'
          }
        }}
      />
      {token
        ? <Dashboard token={token} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
        : <Login onLogin={handleLogin} />
      }
    </>
  )
}
