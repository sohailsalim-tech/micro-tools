import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "About Us — OPUS Productivity Tools",
  description:
    "Learn about OPUS Productivity Tools and tecpdf.com — free, fast, private PDF tools built for everyone.",
  alternates: { canonical: "https://tecpdf.com/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image src="/opus-logo.png" alt="OPUS Productivity Tools" width={36} height={36} />
            <span className="font-bold text-lg text-foreground tracking-tight">OPUS Productivity Tools</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to tools
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">About Us</h1>
        <p className="text-muted-foreground leading-relaxed mb-10 text-base">
          OPUS Productivity Tools is a free online PDF toolkit built for individuals, students, and
          professionals who need reliable document tools — without paywalls or sign-ups.
        </p>

        <div className="space-y-10">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">What We Do</h2>
            <p className="text-muted-foreground leading-relaxed">
              We provide fast, private, browser-based PDF tools including compression, merging,
              splitting, conversion, password protection, AI-powered summarization, and document
              translation. All processing happens on secure servers and your files are never stored
              beyond the time needed to complete your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Our Tools</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: "/compress",     label: "Compress PDF" },
                { href: "/merge",        label: "Merge PDF" },
                { href: "/split",        label: "Split PDF" },
                { href: "/protect",      label: "Protect PDF" },
                { href: "/jpg-to-pdf",   label: "JPG to PDF" },
                { href: "/pdf-to-jpg",   label: "PDF to JPG" },
                { href: "/word-to-pdf",  label: "Word to PDF" },
                { href: "/excel-to-pdf", label: "Excel to PDF" },
                { href: "/summarize",    label: "AI PDF Summarizer" },
                { href: "/translate",    label: "AI PDF Translator" },
              ].map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Privacy First</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not require accounts, logins, or personal information to use any tool. Uploaded
              files are processed and immediately discarded. We do not sell data or share files with
              third parties. For full details, see our{" "}
              <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:no-underline">
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
            </p>
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">📧</span>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <a
                    href="mailto:privacy@tecpdf.com"
                    className="text-sm font-medium text-foreground hover:underline underline-offset-2"
                  >
                    privacy@tecpdf.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🌐</span>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Website</p>
                  <a
                    href="https://tecpdf.com"
                    className="text-sm font-medium text-foreground hover:underline underline-offset-2"
                  >
                    tecpdf.com
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                We typically respond within 1–2 business days.
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground space-y-1">
          <p>© {new Date().getFullYear()} OPUS Productivity Tools · tecpdf.com</p>
          <p className="flex items-center justify-center gap-3">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
