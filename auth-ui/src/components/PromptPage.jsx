import { useEffect, useRef, useState } from 'react'
import ToggleButton from './ToggleButton'
import { searchAPI, tokenManager } from '../services/api'

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
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])


  const resultsEndRef = useRef(null);

  // useEffect(() => {
  //   resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [results]);
  



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsSearching(true)
    setError('')
    try {
      const token = tokenManager.getToken()
      if (!token) throw new Error('Please log in first')

      const data = await searchAPI.search(prompt, token)
      console.log('Search response:', data)
      setResults(data?.results || [])
      onSubmit?.(prompt)
    } catch (err) {
      console.error('Search error:', err)
      setError(err?.message || 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

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
      <main className={`relative flex-1 flex flex-col h-screen p-4 sm:p-6 ${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <ToggleButton isOn={isDark} onToggle={setIsDark} />
        </div>
        <div className="h-full w-full flex  overflow-y-scroll">
          <div className="w-full  text-center space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
              Where should we begin{userName ? `, ${userName}` : ''}?
            </h1>
            <form onSubmit={handleSend} className="w-full max-w-xl mx-auto sticky top-4 z-10 bg-transparent">
    <div className="relative">
              {/* <div className="relative w-full max-w-xl"> */}
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your prompt here..."
                  className={`w-full rounded-xl px-4 py-3 pr-12 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${isDark ? 'border border-slate-700 bg-slate-800 text-white placeholder:text-slate-400' : 'border border-indigo-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-indigo-600 p-2 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                  disabled={!prompt.trim() || isSearching}
                  aria-label="Submit prompt"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M12 3l-1.41 1.41L16.17 10H3v2h13.17l-5.58 5.59L12 19l8-7z" />
                  </svg>
                </button>
              </div>
            </form>


 
{/* <div className="flex-1 overflow-y-auto mt-4 space-y-2">
  {results.map((r, idx) => (
    <div key={idx} className="flex flex-col w-full">
      
      <div className="text-right text-slate-900 dark:text-white">
        {r.prompt} 
      </div>

      
      <div className={`text-left mt-1 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
        {r.summary || r.response}
      </div>
    </div>
  ))}
  <div ref={resultsEndRef} />
</div> */}



            {error && (
              <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</div>
            )}

            {results?.length > 0 && (
              <div className="text-left space-y-2 w-full mx-auto">
                {results.map((r, idx) => (
                  <div key={idx} className={`rounded-lg p-3 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} shadow-sm`}>
                    <div className="font-semibold mb-1">{r.title || 'Result'}</div>
                    {r.url && (
                      <a className="text-indigo-600 text-sm" href={r.url} target="_blank" rel="noreferrer">{r.url}</a>
                    )}
                    {r.summary && (
                      <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
