import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image src="/opus-logo.png" alt="OPUS Productivity Tools" width={36} height={36} />
            <span className="font-bold text-lg text-foreground tracking-tight">OPUS Productivity Tools</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <p className="text-7xl font-bold text-muted-foreground/30 mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. Try one of our free PDF tools below.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { href: "/compress", label: "🗜️ Compress PDF" },
            { href: "/merge", label: "🔗 Merge PDF" },
            { href: "/split", label: "✂️ Split PDF" },
            { href: "/protect", label: "🔒 Protect PDF" },
            { href: "/jpg-to-pdf", label: "🖼️ JPG to PDF" },
            { href: "/pdf-to-jpg", label: "📄 PDF to JPG" },
            { href: "/word-to-pdf", label: "📝 Word to PDF" },
            { href: "/excel-to-pdf", label: "📊 Excel to PDF" },
            { href: "/summarize", label: "🧠 PDF Summarizer" },
            { href: "/translate", label: "🌐 PDF Translator" },
            { href: "/chat",      label: "💬 Chat with PDF" },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="px-4 py-2 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all text-sm text-foreground"
            >
              {tool.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
        >
          ← Back to all tools
        </Link>
      </div>
    </main>
  );
}
