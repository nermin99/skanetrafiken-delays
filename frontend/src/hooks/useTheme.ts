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

    // Tint the mobile browser chrome (e.g. iOS Safari's status bar) to match the page header,
    // reading the same brand tokens the header uses so the two can't drift apart. index.html ships
    // a prefers-color-scheme pair for the pre-JS paint; point both at the active theme's colour so
    // the browser shows it whichever media query matches (e.g. a manual toggle against the OS).
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
