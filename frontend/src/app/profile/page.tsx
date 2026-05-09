"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { clearAllCookies } from "@/lib/clearCookies"
import {
  Moon, Sun, User, Mail, Shield, LogOut, ArrowLeft,
  Leaf, ChevronRight, Bell, Globe, Palette,
  Trash2, AlertTriangle, X, Sprout, MessageSquare,
  Info, BarChart2, CheckCircle
} from "lucide-react"
import { useLanguage } from "@/components/LanguageProvider"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDark, toggleDark } = useTheme()
  const { t, language, setLanguage } = useLanguage()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  const handleSignOut = async () => {
    clearAllCookies()
    await signOut({ callbackUrl: "/", redirect: true })
  }

  const handleDeleteAccount = async () => {
    if (!session?.user?.email) return
    setIsDeleting(true)
    setDeleteError("")
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Failed to delete account")
      }
      clearAllCookies()
      await signOut({ callbackUrl: "/", redirect: true })
    } catch (err: any) {
      setDeleteError(err.message || "Something went wrong. Please try again.")
      setIsDeleting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    )
  }

  if (!session) return null

  const isGoogle = !!(session.user as any)?.image?.includes("googleusercontent")
  const initials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const CONFIRM_PHRASE = "DELETE"

  const quickLinks = [
    { label: t("profile.crops_dashboard"), href: "/crops", icon: Sprout, color: "text-green-600 bg-green-50 dark:bg-green-900/30", desc: t("profile.crops_dashboard_desc") },
    { label: t("profile.get_recommendations"), href: "/", icon: BarChart2, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30", desc: t("profile.get_recommendations_desc") },
    { label: t("profile.about_farmiq"), href: "/about", icon: Info, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30", desc: t("profile.about_farmiq_desc") },
    { label: t("profile.contact_support"), href: "/contact", icon: MessageSquare, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30", desc: t("profile.contact_support_desc") },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Profile Header Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Cover Banner with embedded profile info */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative p-8">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="shrink-0">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="w-24 h-24 rounded-2xl ring-4 ring-white/20 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl ring-4 ring-white/20 shadow-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 mt-2">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{session.user?.name}</h1>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-sm text-green-50">
                  <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <Mail size={15} />
                    {session.user?.email}
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <CheckCircle size={15} className="text-green-300" />
                    {t("profile.active_account")}
                  </span>
                </div>
              </div>
              
              <div className="absolute top-0 right-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  isGoogle
                    ? "bg-white text-blue-700"
                    : "bg-white text-green-700"
                }`}>
                  <Shield size={12} />
                  {isGoogle ? t("profile.google_account") : t("profile.email_account")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Appearance & Settings ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div 
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
          >
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-green-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">{t("profile.appearance_settings")}</h2>
            </div>
            <ChevronRight size={18} className={`text-gray-400 transition-transform duration-300 ${isAppearanceOpen ? "rotate-90" : ""}`} />
          </div>

          {/* Accordion Body */}
          <div className={`transition-all duration-300 origin-top overflow-hidden ${isAppearanceOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
            {/* Dark Mode Toggle */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-colors ${isDark ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-amber-50 dark:bg-amber-900/30"}`}>
                {isDark
                  ? <Moon size={18} className="text-indigo-600 dark:text-indigo-400" />
                  : <Sun size={18} className="text-amber-500" />
                }
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{t("profile.dark_mode")}</p>
                <p className="text-xs text-gray-400">{isDark ? t("profile.dark_theme_active") : t("profile.light_theme_active")}</p>
              </div>
            </div>
            <button
              onClick={toggleDark}
              className={`relative inline-flex h-7 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isDark ? "bg-green-600" : "bg-gray-200"}`}
              style={{ width: "52px" }}
              role="switch"
              aria-checked={isDark}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>

            {/* Language */}
            <div className="relative">
              <div 
                className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                    <Globe size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t("profile.language_region")}</p>
                    <p className="text-xs text-gray-400">{language}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-gray-300 transition-transform duration-200 ${isLanguageOpen ? "rotate-90" : ""}`} />
              </div>
              
              {/* Language Dropdown */}
              {isLanguageOpen && (
                <div className="mx-6 mb-4 mt-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {["English (India)", "English (US)", "Hindi (India)", "Bengali (India)"].map((lang) => (
                    <button
                      key={lang}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${language === lang ? "text-green-600 dark:text-green-400 font-semibold bg-green-50/50 dark:bg-green-900/10" : "text-gray-700 dark:text-gray-300"}`}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                  <Bell size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t("profile.notifications")}</p>
                  <p className="text-xs text-gray-400">{t("profile.notifications_desc")}</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">{t("profile.on")}</span>
            </div>
          </div>
        </div>

        {/* ── Quick Navigation ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div 
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <div className="flex items-center gap-2">
              <Leaf size={18} className="text-green-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">{t("profile.quick_navigation")}</h2>
            </div>
            <ChevronRight size={18} className={`text-gray-400 transition-transform duration-300 ${isNavOpen ? "rotate-90" : ""}`} />
          </div>
          
          <div className={`transition-all duration-300 origin-top overflow-hidden ${isNavOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            {quickLinks.map(({ label, href, icon: Icon, color, desc }, i) => (
              <Link key={label} href={href}>
                <div className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i < quickLinks.length - 1 ? "border-b border-gray-50 dark:border-gray-800/50" : ""}`}>
                  <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Account Actions ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div 
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">{t("profile.account")}</h2>
            </div>
            <ChevronRight size={18} className={`text-gray-400 transition-transform duration-300 ${isAccountOpen ? "rotate-90" : ""}`} />
          </div>

          <div className={`transition-all duration-300 origin-top overflow-hidden ${isAccountOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50"
            >
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
                <LogOut size={17} className="text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("profile.sign_out")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("profile.sign_out_desc")}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 shrink-0" />
            </button>

            {/* Delete Account */}
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setDeleteError(""); }}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 shrink-0">
                <Trash2 size={17} className="text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{t("profile.delete_account")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("profile.delete_account_desc")}</p>
              </div>
              <ChevronRight size={15} className="text-red-300 shrink-0" />
            </button>
          </div>
        </div>

      </main>

      {/* ── Delete Account Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5 leading-relaxed">
              This action is <span className="font-semibold text-red-500">permanent and irreversible</span>. All your crops, settings, and account data will be deleted forever.
            </p>

            {/* Confirm input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Type <span className="text-red-500 font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition disabled:opacity-50 font-mono"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                {t("profile.cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== CONFIRM_PHRASE || isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900/50 text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    {t("profile.delete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
