import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL("https://tecpdf.com"),
  title: {
    default: "TecPDF — Free PDF Tools Online",
    template: "%s | TecPDF",
  },
  description:
    "Free online PDF tools — compress, merge, split, protect, convert JPG to PDF and more. Fast, secure, no signup required.",
  keywords: [
    "pdf tools", "compress pdf", "merge pdf", "split pdf",
    "jpg to pdf", "pdf to jpg", "protect pdf", "free pdf tools online",
  ],
  authors: [{ name: "TecPDF" }],
  creator: "TecPDF",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tecpdf.com",
    siteName: "TecPDF",
    title: "TecPDF — Free PDF Tools Online",
    description:
      "Compress, merge, split, protect and convert PDFs for free. No signup, no limits, works on all devices.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TecPDF — Free PDF Tools Online" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TecPDF — Free PDF Tools Online",
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
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
