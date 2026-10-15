import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans, Noto_Sans_Tamil } from 'next/font/google'
import { AppShell } from '@/components/app-shell/app-shell'
import { PreferencesProvider } from '@/components/providers/preferences-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import './globals.css'

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-tamil',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AgriFin — Farm money, made simple',
    template: '%s · AgriFin',
  },
  description:
    'AgriFin helps small farmers record farm expenses and sales, track buyer payments, and understand their income each harvest season. Available in Tamil and English.',
  generator: 'v0.app',
  applicationName: 'AgriFin',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2f5d3a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoTamil.variable}`}>
      <body className="antialiased">
        <PreferencesProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </PreferencesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
