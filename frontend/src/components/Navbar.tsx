"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthModalContext } from "@/components/AuthModalProvider"
import { useLanguage } from "@/components/LanguageProvider"

export function Navbar() {
  const { data: session, status } = useSession()
  const { isNavGlow, setIsAuthModalOpen } = useAuthModalContext()
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C11.5 2 11 2.19 10.59 2.59L10 3.17L9.41 2.59C9 2.19 8.5 2 8 2C6.89 2 6 2.89 6 4C6 4.5 6.19 5 6.59 5.41L11.29 10.11C11.68 10.5 12.32 10.5 12.71 10.11L17.41 5.41C17.81 5 18 4.5 18 4C18 2.89 17.11 2 16 2C15.5 2 15 2.19 14.59 2.59L14 3.17L13.41 2.59C13 2.19 12.5 2 12 2M12 12C11.45 12 11 12.45 11 13V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V13C13 12.45 12.55 12 12 12Z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">FarmIQ</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
              {t("nav.home")}
            </Link>
            {session ? (
              <Link href="/crops" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
                {t("nav.crops")}
              </Link>
            ) : (
              <div className="text-gray-400 dark:text-gray-600 font-medium cursor-not-allowed opacity-50">
                {t("nav.crops")}
              </div>
            )}
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
              {t("nav.about")}
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium">
              {t("nav.contact")}
            </Link>
          </div>

          {/* Right side — auth area */}
          <div className="hidden md:flex items-center gap-4">
            {status === "loading" ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            ) : session ? (
              <div className="flex items-center gap-3">
                {pathname === "/profile" && (
                  <Link
                    href="/"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors pr-3 border-r border-gray-200 dark:border-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t("nav.back_to_home")}
                  </Link>
                )}
                {/* Avatar + name → click to go to profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                  title="View Profile"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full ring-2 ring-green-100 group-hover:ring-green-300 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-green-100 group-hover:ring-green-300 transition-all">
                      <span className="text-xs font-bold text-green-700">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {session.user?.name}
                  </span>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`text-white px-6 py-2 rounded-lg font-medium transition-all btn-3d btn-3d-primary ${isNavGlow ? "animate-pulseGlow-shake" : ""}`}
              >
                {t("nav.get_started")}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
