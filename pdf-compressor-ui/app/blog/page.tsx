import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — PDF Tips & Guides | OPUS Productivity Tools",
  description:
    "Free guides and tips on compressing, merging, translating, and working with PDF files. From the team at tecpdf.com.",
  alternates: { canonical: "https://tecpdf.com/blog" },
};

export default function BlogPage() {
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

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to tools
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground mb-10">PDF tips, guides, and how-tos from the OPUS team.</p>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <article className="border border-border rounded-xl p-6 bg-card hover:border-foreground/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{post.readTime} min read</span>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:underline underline-offset-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
                <p className="mt-3 text-sm font-medium text-foreground group-hover:underline underline-offset-2">
                  Read article →
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>

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
