import React from 'react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'

import '@eventuras/ratio-ui/ratio-ui.css'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Historia',
    default: 'Historia',
  },
  description: 'Historia - Knowledge management and content platform',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
          >
            Skip to main content
          </a>
          <div className="flex flex-col min-h-screen">
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />

            <Header />
            <main id="main-content" className="flex-1 min-h-[80vh]">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
