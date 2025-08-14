import { useEffect, useRef, useState } from 'react'

function Field({ label, type = 'text', value, onChange, placeholder, error, required }) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-')
  const hasError = Boolean(error)
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-sm text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        className={
          `w-full rounded-xl border px-4 py-2.5 outline-none placeholder:text-gray-400 ` +
          (hasError
            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-400'
            : 'border-gray-300 bg-white/70 focus:ring-2 focus:ring-black/60')
        }
      />
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export default function AuthModals({ isOpen, mode, onClose, onSwitchMode, onSuccess }) {
  const dialogRef = useRef(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const isSignup = mode === 'signup'

  const validate = () => {
    const nextErrors = {}
    if (isSignup && !name.trim()) nextErrors.name = 'User name is required.'
    if (!email.trim()) nextErrors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email.'
    if (!password) nextErrors.password = 'Password is required.'
    else if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => dialogRef.current?.focus(), 0)
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Tab') {
        // rudimentary focus trap inside modal
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toTitleCase = (s) => s.replace(/(^|\s)\w/g, (m) => m.toUpperCase())
  const nameFromEmail = (e) => toTitleCase(e.split('@')[0].replace(/\.|_/g, ' '))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    if (isSignup) {
      console.log('Sign up', { name, email })
      onSuccess?.(name || nameFromEmail(email))
    } else {
      console.log('Log in', { email })
      onSuccess?.(nameFromEmail(email))
    }
    if (!onSuccess) onClose?.()
  }

  const titleId = 'auth-modal-title'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-modalOverlay"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative mx-4 w-full max-w-md rounded-3xl bg-white/70 p-6 shadow-glass backdrop-blur-md transition-all duration-200 ease-out animate-[fadeIn_200ms_ease-out]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/80 text-white hover:bg-black"
        >
          ×
        </button>

        <h2 id={titleId} className="mb-4 text-center text-2xl font-semibold">
          {isSignup ? 'Sign up' : 'Log in'}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <Field
              label="User name"
              value={name}
              onChange={(v) => { setName(v); if (errors.name) validate() }}
              placeholder="Jane Doe"
              error={errors.name}
              required
            />
          )}

          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={(v) => { setEmail(v); if (errors.email) validate() }}
            placeholder="jane@example.com"
            error={errors.email}
            required
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(v) => { setPassword(v); if (errors.password) validate() }}
            placeholder="********"
            error={errors.password}
            required
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-black py-3 font-medium text-white hover:bg-black/90 disabled:opacity-60"
            disabled={!email || !password || (isSignup && !name)}
          >
            {isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                className="font-semibold text-black underline-offset-2 hover:underline"
                onClick={() => { setErrors({}); onSwitchMode?.('login') }}
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don\'t have an account?{' '}
              <button
                className="font-semibold text-black underline-offset-2 hover:underline"
                onClick={() => { setErrors({}); onSwitchMode?.('signup') }}
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}


