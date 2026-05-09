"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import en from "@/dictionaries/en.json"
import hi from "@/dictionaries/hi.json"
import bn from "@/dictionaries/bn.json"

type Language = "en" | "hi" | "bn"

const dictionaries: Record<Language, any> = {
  en,
  hi,
  bn
}

export const languageMap: Record<string, Language> = {
  "English (India)": "en",
  "English (US)": "en",
  "Hindi (India)": "hi",
  "Bengali (India)": "bn"
}

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>("English (India)")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("farmiq-language")
    if (savedLang) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem("farmiq-language", lang)
  }

  // A simple function to get nested keys like "nav.home"
  const t = (path: string): string => {
    if (!mounted) return "" // avoid hydration mismatch on first render if translating static text, but we'll return english fallback
    
    const langCode = languageMap[language] || "en"
    const dict = dictionaries[langCode]
    
    const keys = path.split(".")
    let value: any = dict
    
    for (const key of keys) {
      if (value[key] === undefined) {
        // Fallback to english if key missing
        let fallbackValue: any = dictionaries.en
        for (const k of keys) {
          if (fallbackValue[k] === undefined) return path
          fallbackValue = fallbackValue[k]
        }
        return fallbackValue
      }
      value = value[key]
    }
    
    return value
  }

  // Avoid hydration errors by returning a simple loader or hiding text until mounted
  // Actually, returning English as default is safer for SEO and SSR
  const safeT = (path: string): string => {
    if (!mounted) {
       // On server/first render, just use English
       let value: any = dictionaries.en
       const keys = path.split(".")
       for (const key of keys) {
         if (value[key] === undefined) return path
         value = value[key]
       }
       return value
    }
    return t(path)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: safeT }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
