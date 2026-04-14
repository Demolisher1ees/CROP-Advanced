"use client"

import { createContext, useContext, useMemo, useState } from "react"

interface AuthModalContextValues {
  isAuthModalOpen: boolean
  setIsAuthModalOpen: (value: boolean) => void
  triggerNavGlow: () => void
  isNavGlow: boolean
}

const AuthModalContext = createContext<AuthModalContextValues | undefined>(undefined)

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isNavGlow, setIsNavGlow] = useState(false)

  const triggerNavGlow = () => {
    setIsNavGlow(true)
    window.setTimeout(() => setIsNavGlow(false), 1600)
  }

  const value = useMemo(
    () => ({ isAuthModalOpen, setIsAuthModalOpen, triggerNavGlow, isNavGlow }),
    [isAuthModalOpen, isNavGlow]
  )

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
}

export function useAuthModalContext() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error("useAuthModalContext must be used within AuthModalProvider")
  }
  return context
}
