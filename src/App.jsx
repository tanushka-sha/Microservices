import { useState } from 'react'
import './index.css'
import AuthModals from './components/AuthModals'
import Welcome from './components/Welcome'
import PromptPage from './components/PromptPage'
import ImageGenPage from './components/ImageGenPage'

function App() {
  const [open, setOpen] = useState(true)
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState('Ethan')
  const [page, setPage] = useState('auth') // 'auth' | 'welcome' | 'prompt' | 'image'

  const isPrompt = page === 'prompt'
  return (
    <div className={
      isPrompt
        ? 'w-full overflow-hidden'
        : "min-h-screen w-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4"
    }>
      {page === 'image' ? (
        <ImageGenPage onSubmit={(t) => console.log('Generate image:', t)} userName={userName} onLogout={() => { setShowWelcome(false); setPage('auth'); setOpen(true) }} />
      ) : page === 'prompt' ? (
        <PromptPage
          onSubmit={(p) => console.log('Prompt submitted:', p)}
          userName={userName}
          onLogout={() => { setShowWelcome(false); setPage('auth'); setOpen(true); }}
        />
      ) : showWelcome ? (
        <Welcome
          userName={userName}
          toolName="AI Studio"
          onClickPrompt={() => setPage('prompt')}
          onClickImage={() => setPage('image')}
        />
      ) : (
        <AuthModals
          isOpen={open}
          mode={mode}
          onClose={() => setOpen(false)}
          onSwitchMode={(m) => setMode(m)}
          onSuccess={(name) => { setUserName(name || 'User'); setShowWelcome(true); setPage('welcome') }}
        />
      )}

      {!open && (
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
