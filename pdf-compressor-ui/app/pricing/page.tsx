import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Pricing — OPUS Productivity Tools | Free PDF Tools",
  description:
    "OPUS PDF Tools is free to use. See what's included in the free plan and what's coming in Pro.",
  alternates: { canonical: "https://tecpdf.com/pricing" },
};

const FREE_FEATURES = [
  "All 11 PDF tools — no signup required",
  "Compress, Merge, Split, Protect PDF",
  "JPG ↔ PDF, Word to PDF, Excel to PDF",
  "AI PDF Summarizer (3 per hour)",
  "AI PDF Translator — 10 languages (2 per hour)",
  "Chat with PDF — 20 messages per session (3 per hour)",
  "Files permanently deleted after processing",
  "Works on all devices",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Higher file size limits (up to 50 MB)",
  "Higher rate limits — 20 requests per hour",
  "Priority processing queue",
  "Longer Chat with PDF sessions (50 messages)",
  "No ads",
  "Email support",
];

export default function PricingPage() {
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to tools
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Simple, honest pricing
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            All 11 PDF tools are free — forever. Pro is coming soon for power users who need more.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">

          {/* Free */}
          <div className="bg-card border-2 border-border rounded-2xl p-6 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground text-sm mb-1">/ forever</span>
              </div>
              <p className="text-sm text-muted-foreground">No signup. No credit card. No catch.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="w-full py-3 rounded-xl font-semibold text-sm text-center bg-foreground text-background hover:opacity-90 transition-opacity block"
            >
              Start using free tools →
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-card border-2 border-blue-500/40 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">
                COMING SOON
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-foreground">$9</span>
                <span className="text-muted-foreground text-sm mb-1">/ month</span>
              </div>
              <p className="text-sm text-muted-foreground">For professionals and heavy users.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-3 rounded-xl font-semibold text-sm text-center bg-blue-500/20 text-blue-400 cursor-not-allowed border border-blue-500/30"
            >
              Notify me when Pro launches
            </button>
          </div>
        </div>

        {/* FAQ */}
        <section className="space-y-6 text-sm text-muted-foreground max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-foreground text-center mb-6">Frequently asked questions</h2>

          {[
            {
              q: "Is it really free?",
              a: "Yes. All 11 tools are completely free to use with no signup, no watermarks, and no hidden fees. We're supported by non-intrusive ads.",
            },
            {
              q: "Are there any file size limits?",
              a: "Free plan limits vary by tool — typically 3–20 MB per file. AI tools (Summarizer, Translator, Chat) have a 3–5 MB limit. Pro will raise these to 50 MB.",
            },
            {
              q: "Are my files private?",
              a: "Yes. Every uploaded file is processed on our secure server and permanently deleted immediately after your result is ready. We never store, share, or analyse your documents.",
            },
            {
              q: "What payment methods will Pro support?",
              a: "Pro will be powered by Paddle, accepting all major credit and debit cards worldwide.",
            },
            {
              q: "When is Pro launching?",
              a: "We're working on it. Follow our progress at tecpdf.com or check back soon.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-border pb-5">
              <p className="font-semibold text-foreground mb-1.5">{q}</p>
              <p className="leading-relaxed">{a}</p>
            </div>
          ))}
        </section>
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
            <span>·</span>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
