import type { ThemeMode } from '@astryxdesign/core/theme'
import React, { createContext, useContext, useState } from 'react'

type ThemeContext = {
  theme: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContext | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('system')

  function toggleTheme() {
    setTheme((prevTheme) => {
      if (prevTheme === 'system') return 'light'
      if (prevTheme === 'light') return 'dark'
      return 'system' // Loops back to system, or you can return 'light' if you want a strict toggle
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeChanger() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
