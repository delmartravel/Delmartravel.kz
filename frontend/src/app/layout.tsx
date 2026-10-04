/* eslint-disable @next/next/no-css-tags */

import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import { RippleProvider } from "@/components/ui/ripple-button";

import "./globals.css";
import "../styles/legacy-home.css";
import "../styles/legacy-country-decor.css";
import "../styles/legacy-turkey-decor.css";
import "../styles/legacy-search.css";
import "../styles/theme-overrides.css";
import "../styles/country-modern.css";
import "../styles/search-modern.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Del Mar Travel — премиальные путешествия",
    template: "%s | Del Mar Travel",
  },
  description: "Премиальный подбор путешествий Del Mar Travel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const s=localStorage.getItem('theme');const t=s==='dark'||s==='light'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';const r=document.documentElement;r.classList.toggle('dark',t==='dark');r.dataset.theme=t;r.style.colorScheme=t}catch{}` }} />
        <link rel="stylesheet" href="/assets/vendor/bootstrap-icons/bootstrap-icons.min.css" />
      </head>
      <body><RippleProvider />{children}</body>
    </html>
  );
}
