import Link from "next/link";
import Image from "next/image"; // used for OPUS logo in header
import { ThemeToggle } from "@/components/theme-toggle";

const tools = [
  {
    href: "/compress",
    emoji: "🗜️",
    title: "Compress PDF",
    description: "Reduce PDF size by up to 90%. Perfect for email, web, and storage.",
    badge: null,
    color: "from-blue-500/10 to-indigo-500/10",
    border: "hover:border-blue-400",
    badgeColor: "",
  },
  {
    href: "/jpg-to-pdf",
    emoji: "🖼️",
    title: "JPG to PDF",
    description: "Combine multiple images into one compressed PDF album in seconds.",
    badge: "NEW",
    color: "from-violet-500/10 to-purple-500/10",
    border: "hover:border-violet-400",
    badgeColor: "bg-violet-500",
  },
  {
    href: "/merge",
    emoji: "🔗",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    badge: "NEW",
    color: "from-emerald-500/10 to-teal-500/10",
    border: "hover:border-emerald-400",
    badgeColor: "bg-emerald-500",
  },
  {
    href: "/split",
    emoji: "✂️",
    title: "Split PDF",
    description: "Extract pages or split a PDF into multiple files.",
    badge: "NEW",
    color: "from-orange-500/10 to-amber-500/10",
    border: "hover:border-orange-400",
    badgeColor: "bg-orange-500",
  },
  {
    href: "/pdf-to-jpg",
    emoji: "📄",
    title: "PDF to JPG",
    description: "Convert every page of a PDF into high-quality images.",
    badge: "NEW",
    color: "from-rose-500/10 to-pink-500/10",
    border: "hover:border-rose-400",
    badgeColor: "bg-rose-500",
  },
  {
    href: "/protect",
    emoji: "🔒",
    title: "Protect PDF",
    description: "Add a password to your PDF to prevent unauthorised access.",
    badge: "NEW",
    color: "from-sky-500/10 to-cyan-500/10",
    border: "hover:border-sky-400",
    badgeColor: "bg-sky-500",
  },
  {
    href: "/word-to-pdf",
    emoji: "📝",
    title: "Word to PDF",
    description: "Convert .doc and .docx files to PDF instantly. Free and accurate.",
    badge: "NEW",
    color: "from-blue-500/10 to-indigo-500/10",
    border: "hover:border-blue-400",
    badgeColor: "bg-blue-500",
  },
  {
    href: "/excel-to-pdf",
    emoji: "📊",
    title: "Excel to PDF",
    description: "Convert .xls and .xlsx spreadsheets to PDF instantly. Free and accurate.",
    badge: "NEW",
    color: "from-green-500/10 to-emerald-500/10",
    border: "hover:border-green-400",
    badgeColor: "bg-green-500",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/opus-logo.png" alt="OPUS Productivity Tools" width={36} height={36} />
            <span className="font-bold text-lg text-foreground tracking-tight">OPUS Productivity Tools</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight mb-3">
          All the PDF tools{" "}<br className="hidden sm:block" />you&apos;ll ever need
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Free. Fast. No signup required. Every tool works right in your browser.
        </p>
      </section>

      {/* Tool Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {tools.map((tool) => {
            const isComingSoon = tool.badge === "SOON";
            const card = (
              <div
                className={`
                  relative group rounded-xl border-2 border-border p-4 sm:p-6
                  bg-gradient-to-br ${tool.color}
                  transition-all duration-200
                  ${isComingSoon ? "opacity-60 cursor-default" : `cursor-pointer ${tool.border} hover:shadow-lg hover:-translate-y-0.5`}
                `}
              >
                {tool.badge && (
                  <span className={`absolute top-3 right-3 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                )}
                <div className="text-3xl sm:text-4xl mb-3">{tool.emoji}</div>
                <h2 className="font-semibold text-sm sm:text-base text-foreground mb-1">{tool.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-snug">{tool.description}</p>
              </div>
            );

            return isComingSoon ? (
              <div key={tool.title}>{card}</div>
            ) : (
              <Link key={tool.title} href={tool.href} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">🔒 Files never stored</span>
          <span className="flex items-center gap-1.5">⚡ Fast &amp; reliable</span>
          <span className="flex items-center gap-1.5">🆓 Always free</span>
          <span className="flex items-center gap-1.5">🌍 Works on all devices</span>
        </div>
      </section>
    </main>
  );
}
