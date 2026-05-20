import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function initialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, theme)

    // Tint the browser chrome to match the header on manual toggles — index.html's prefers-color-scheme
    // tags only track the OS. (iOS Safari 18+ ignores theme-color and uses the body background from
    // index.css, which already follows the .dark class set above; this is for Chrome/Android et al.)
    const brand = getComputedStyle(document.documentElement)
      .getPropertyValue(isDark ? '--color-brand-dark' : '--color-brand')
      .trim()
    if (brand) {
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', brand))
    }
  }, [theme])

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggle }
}
