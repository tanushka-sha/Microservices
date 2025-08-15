import { useEffect, useState } from 'react'

export default function ToggleButton({ isOn: controlledIsOn, onToggle }) {
  const [internalIsOn, setInternalIsOn] = useState(Boolean(controlledIsOn))

  // Keep internal state in sync when used as a controlled component
  useEffect(() => {
    if (typeof controlledIsOn === 'boolean') {
      setInternalIsOn(controlledIsOn)
    }
  }, [controlledIsOn])

  const isOn = typeof controlledIsOn === 'boolean' ? controlledIsOn : internalIsOn

  const handleClick = () => {
    const next = !isOn
    if (onToggle) onToggle(next)
    if (typeof controlledIsOn !== 'boolean') setInternalIsOn(next)
  }

  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex h-5 w-12 items-center rounded-full transition-colors duration-300 ${
        isOn ? 'bg-gray-600' : 'bg-gray-400'
      }`}
      type="button"
      aria-pressed={isOn}
      aria-label={isOn ? 'Dark mode' : 'Light mode'}
    >
      <span
        className="absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-md"
        style={{
          left: isOn ? '30px' : '2px',
          transition: 'left 300ms ease',
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white pointer-events-none">
        {isOn ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}

