import { useEffect, useRef, useState } from 'react'
import ToggleButton from './ToggleButton'

const IconButton = ({ children, label, active, onClick, darkMode = false }) => (
  <button
    aria-label={label}
    title={label}
    onClick={onClick}
    className={
      `group relative grid h-10 w-10 place-items-center rounded-lg ` +
      (active
        ? (darkMode ? 'bg-slate-700 text-white' : 'bg-indigo-100 text-indigo-700')
        : (darkMode ? 'text-slate-200 hover:bg-slate-700/60' : 'text-slate-700 hover:bg-white/70'))
    }
  >
    {children}
    <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{label}</span>
  </button>
)

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
    <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" />
  </svg>
)

 

export default function PromptPage({ onSubmit, userName, onLogout, onNavigateToDashboard }) {
  const [prompt, setPrompt] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const profileWrapRef = useRef(null)

  

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`h-screen overflow-hidden w-full flex ${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-16 shrink-0 border-r backdrop-blur-sm p-3 flex flex-col justify-between items-center ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white/60'}` }>
        <div className="space-y-2">
          <IconButton darkMode={isDark} label="New chat" active><PencilIcon /></IconButton>
          <IconButton darkMode={isDark} label="Search"><SearchIcon /></IconButton>
          <IconButton darkMode={isDark} label="Dashboard" onClick={onNavigateToDashboard}><DashboardIcon /></IconButton>
        </div>
        <div className="relative" ref={profileWrapRef}>
          <IconButton darkMode={isDark} label="Profile" onClick={() => setProfileMenuOpen(o => !o)}>
            <UserIcon />
          </IconButton>
          {profileMenuOpen && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 ml-24 z-20 rounded-md border border-slate-200 bg-white shadow-lg min-w-[180px] p-1">
              <button
                className="mt-1 block w-full whitespace-nowrap px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => {
                  setProfileMenuOpen(false)
                  onLogout?.() || alert('Logged out')
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 p-4 sm:p-6">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <ToggleButton isOn={isDark} onToggle={setIsDark} />
          {/* <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-indigo-700">Export</button> */}
        </div>
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-full max-w-3xl text-center space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Where should we begin{userName ? `, ${userName}` : ''}?
            </h1>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(prompt) }} className="flex justify-center">
              <div className="relative w-full max-w-xl">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your prompt here..."
                  className={`w-full rounded-xl px-4 py-3 pr-12 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${isDark ? 'border border-slate-700 bg-slate-800 text-white placeholder:text-slate-400' : 'border border-indigo-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-indigo-600 p-2 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                  disabled={!prompt.trim()}
                  aria-label="Submit prompt"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M12 3l-1.41 1.41L16.17 10H3v2h13.17l-5.58 5.59L12 19l8-7z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
