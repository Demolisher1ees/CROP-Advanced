"use client"

import { useEffect } from "react"
import { useAuthModalContext } from "@/components/AuthModalProvider"

/**
 * Invisible component that auto-opens the AuthModal when NextAuth
 * redirects an unauthenticated user to the homepage (/?callbackUrl=...).
 */
export function ModalAutoOpener({ shouldOpen }: { shouldOpen: boolean }) {
  const { setIsAuthModalOpen } = useAuthModalContext()

  useEffect(() => {
    if (shouldOpen) {
      setIsAuthModalOpen(true)
    }
  }, [shouldOpen, setIsAuthModalOpen])

  return null
}
