"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  isDark: boolean
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleDark: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("farmiq-theme")
    // Force default to light unless specifically set to dark
    const dark = stored === "dark"
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }, [])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("farmiq-theme", next ? "dark" : "light")
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
