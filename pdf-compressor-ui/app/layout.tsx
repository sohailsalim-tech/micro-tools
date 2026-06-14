import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieBanner } from '@/components/cookie-banner'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL("https://tecpdf.com"),
  title: {
    default: "OPUS Productivity Tools — Free PDF Tools Online",
    template: "%s | OPUS Productivity Tools",
  },
  description:
    "Free online PDF tools — compress, merge, split, protect, convert, summarize and translate PDFs with AI. Fast, secure, no signup required.",
  keywords: [
    "pdf tools", "compress pdf", "merge pdf", "split pdf",
    "jpg to pdf", "pdf to jpg", "protect pdf", "free pdf tools online",
    "word to pdf", "excel to pdf", "convert pdf online", "pdf converter free",
    "reduce pdf size", "pdf compressor", "combine pdf files",
    "pdf summarizer", "summarize pdf", "pdf translator", "translate pdf",
    "ai pdf tools", "pdf to spanish", "pdf translation online",
  ],
  authors: [{ name: "OPUS Productivity Tools" }],
  creator: "OPUS Productivity Tools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tecpdf.com",
    siteName: "OPUS Productivity Tools",
    title: "OPUS Productivity Tools — Free PDF Tools Online",
    description:
      "Compress, merge, split, protect and convert PDFs for free. No signup, no limits, works on all devices.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OPUS Productivity Tools — Free PDF Tools Online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OPUS Productivity Tools — Free PDF Tools Online",
    description: "Compress, merge, split, protect and convert PDFs for free.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: {
    canonical: "https://tecpdf.com",
  },
  verification: {
    google: "aTxMspMs2TYxTjrWZmqRWBYEoy5y2MdJ_vosb0BwBMw",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <CookieBanner />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId="G-SVQP1NN76T" />}
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8099003900260030"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
