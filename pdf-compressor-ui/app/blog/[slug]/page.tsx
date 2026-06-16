import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPost, getAllSlugs, posts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | OPUS Productivity Tools`,
    description: post.description,
    alternates: { canonical: `https://tecpdf.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://tecpdf.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== slug).slice(0, 2);

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
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← All articles
          </Link>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-4">
            {post.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed text-base">
            {post.description}
          </p>
        </div>

        <hr className="border-border mb-8" />

        {/* Article body */}
        <article className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-base font-semibold text-foreground mb-2">
                  {section.heading}
                </h2>
              )}
              {section.body.split("\n").map((line, j) =>
                line.trim() === "" ? null : (
                  <p key={j} className="mb-2">
                    {line}
                  </p>
                )
              )}
            </div>
          ))}
        </article>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-xl bg-card border border-border">
          <p className="text-sm font-semibold text-foreground mb-1">Try it free — no signup needed</p>
          <p className="text-xs text-muted-foreground mb-4">
            All 11 PDF tools are free at tecpdf.com. No watermark. No account required.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Browse all tools →
          </Link>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-base font-semibold text-foreground mb-4">Related articles</h3>
            <div className="space-y-3">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                  <div className="border border-border rounded-lg p-4 bg-card hover:border-foreground/30 transition-all">
                    <p className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{p.readTime} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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
