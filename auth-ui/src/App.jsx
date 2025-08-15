import { useState, useEffect } from 'react'
import './index.css'
import AuthModals from './components/AuthModals'
import Welcome from './components/Welcome'
import PromptPage from './components/PromptPage'
import ImageGenPage from './components/ImageGenPage'
import Dashboard from './components/Dashboard'
import { tokenManager, authAPI } from './services/api'

function App() {
  const [open, setOpen] = useState(false) // Start with auth modal closed
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState('Ethan')
  const [userData, setUserData] = useState(null)
  const [page, setPage] = useState('auth') // 'auth' | 'welcome' | 'prompt' | 'image' | 'dashboard'
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  const isPrompt = page === 'prompt'

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = tokenManager.getToken()
        if (token) {
          // Try to validate the token by calling the /auth/me endpoint
          const userInfo = await authAPI.getCurrentUser(token)
          console.log('Token is valid, user info:', userInfo)
          
          // Token is valid, show welcome page
          setUserName(userInfo.username || 'User')
          setUserData(userInfo)
          setShowWelcome(true)
          setPage('welcome')
          setOpen(false)
        } else {
          // No token, show auth modal
          console.log('No token found, showing auth modal')
          setOpen(true)
        }
      } catch (error) {
        console.error('Token validation failed:', error)
        // Token is invalid or expired, clear it and show auth modal
        tokenManager.removeToken()
        setOpen(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const handleAuthSuccess = (name, userInfo) => {
    setUserName(name || 'User')
    setUserData(userInfo)
    setShowWelcome(true)
    setPage('welcome')
    setOpen(false)
  }

  const handleLogout = () => {
    // Clear stored token
    tokenManager.removeToken()
    // Reset app state
    setShowWelcome(false)
    setPage('auth')
    setOpen(true)
    setUserData(null)
    setUserName('User')
  }

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={
      isPrompt
        ? 'w-full overflow-hidden'
        : "min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4"
    }>
      {page === 'dashboard' ? (
        <Dashboard 
          userName={userName} 
          onLogout={handleLogout} 
          onBackToWelcome={() => setPage('welcome')}
        />
      ) : page === 'image' ? (
        <ImageGenPage 
          onSubmit={(t) => console.log('Generate image:', t)} 
          userName={userName} 
          onLogout={handleLogout}
          onNavigateToDashboard={() => setPage('dashboard')}
        />
      ) : page === 'prompt' ? (
        <PromptPage
          onSubmit={(p) => console.log('Prompt submitted:', p)}
          userName={userName}
          onLogout={handleLogout}
          onNavigateToDashboard={() => setPage('dashboard')}
        />
      ) : showWelcome ? (
        <Welcome
          userName={userName}
          toolName="AI Studio"
          onClickPrompt={() => setPage('prompt')}
          onClickImage={() => setPage('image')}
          onClickDashboard={() => setPage('dashboard')}
        />
      ) : (
        <AuthModals
          isOpen={open}
          mode={mode}
          onClose={() => setOpen(false)}
          onSwitchMode={(m) => setMode(m)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {!open && !showWelcome && (
        <button
          onClick={() => {
            setMode('signup')
            setOpen(true)
          }}
          className="fixed bottom-6 right-6 rounded-full bg-black/80 text-white px-5 py-3 shadow-lg hover:bg-black"
        >
          Open Sign up
        </button>
      )}

      {/* Continue button removed; real success triggers Welcome via onSuccess */}
    </div>
  )
}

export default App
