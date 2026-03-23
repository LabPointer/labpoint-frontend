import { ComputerIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)
  }

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="relative w-8 h-8 overflow-hidden rounded-full shadow-inner dark:bg-cyan-100/20 shadow-black/20 dark:shadow-white/40 border border-black/10 dark:border-white/20 cursor-pointer transition-colors duration-300 ease-in"
    >
      <div className="relative w-full h-full">
        <SunIcon className={`absolute w-6 h-6 text-yellow-500 transition-all duration-300 ease-in ${mode === 'light' ? 'translate-x-[3px] translate-y-[3px]' : 'translate-x-[3px] translate-y-[32px]'}`} />
        <MoonIcon className={`absolute w-6 h-6 text-cyan-100 transition-all duration-300 ease-in ${mode === 'dark' ? 'translate-x-[3px] translate-y-[3px]' : 'translate-x-[3px] translate-y-[32px]'}`} />
        <ComputerIcon className={`absolute w-5 h-5 text-white transition-all duration-300 ease-in ${mode === 'auto' ? 'translate-x-[5px] translate-y-[5px]' : 'translate-x-[5px] translate-y-[32px]'}`} />
      </div>
    </button>
  )
}
