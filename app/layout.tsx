'use client';

import './globals.css';
import '../zeus-icons.js';
import '../zeus-styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'
import Script from 'next/script';
import { Providers } from '@/components/Providers';
import { ComponentSelectorHelper } from '@/components/component-selector-helper';



const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  // Check if we're in the main application context and prevent rendering
  // if we're not supposed to show the floating chat
  const isMainApp = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('mainApp') === 'true' ||
    window.location.pathname === '/editor'
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ComponentSelectorHelper />
          {children}
          
          
        </Providers>
              <Script src="http://localhost:3030/inspector-client.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}