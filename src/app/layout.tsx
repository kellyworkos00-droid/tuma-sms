import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import type { ReactNode } from 'react';

import { BRAND } from '@/lib/brand';

import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const text = Figtree({ subsets: ['latin'], variable: '--font-text', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} | ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description: 'Upload your customer list as a CSV, write one message and reach everyone by SMS. Clean numbers, personal messages and clear costs before you send.',
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" id="top" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "(function(){var r=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('fx');setTimeout(function(){if(!r.dataset.fxReady)r.classList.remove('fx')},3000)}})()" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
