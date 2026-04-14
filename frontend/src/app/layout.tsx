import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { AuthModalProvider } from '@/components/AuthModalProvider'
import { AuthModal } from '@/components/AuthModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FarmIQ',
  description: 'AI-powered crop recommendation system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthModalProvider>
            <AuthModal />
            {children}
          </AuthModalProvider>
        </Providers>
      </body>
    </html>
  )
}
