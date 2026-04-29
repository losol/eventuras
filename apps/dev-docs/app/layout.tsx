import React from 'react';
import type { Metadata } from 'next';

import { Navbar } from '@eventuras/ratio-ui/core/Navbar';

import { ThemeProvider } from './providers';
import { SearchButton } from './search-wrapper';
import { DocsThemeToggle } from './theme-toggle';

import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Eventuras Docs',
    default: 'Eventuras Docs',
  },
  description: 'Documentation for Eventuras — Event and Course Management Solution',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('eventuras-docs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <Navbar sticky>
            <Navbar.Brand>
              <a href="/" className="text-lg tracking-tight whitespace-nowrap no-underline">
                Eventuras Docs
              </a>
            </Navbar.Brand>
            <Navbar.Content className="justify-end">
              <SearchButton />
              <DocsThemeToggle />
            </Navbar.Content>
          </Navbar>
          <div className="min-h-screen">
            {children}
          </div>
          <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            GPL-2.0-or-later {new Date().getFullYear()} © Eventuras
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
