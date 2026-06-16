import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Refund Policy — OPUS Productivity Tools",
  description: "Refund policy for OPUS Productivity Tools Pro subscriptions at tecpdf.com.",
  alternates: { canonical: "https://tecpdf.com/refund" },
};

export default function RefundPage() {
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="text-xs text-muted-foreground mb-10">Last updated: June 16, 2025</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Free Plan</h2>
            <p>
              All tools on tecpdf.com are free to use with no payment required. There is nothing to
              refund on the free plan.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Pro Subscription — 14-Day Refund Guarantee</h2>
            <p>
              If you subscribe to OPUS Productivity Tools Pro and are not satisfied, you may request
              a full refund within <strong className="text-foreground">14 days</strong> of your initial
              purchase. No questions asked.
            </p>
            <p className="mt-3">
              Refund requests made after 14 days of the initial purchase will not be eligible for a
              refund, except where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Renewals</h2>
            <p>
              Subscription renewals are not refundable. We recommend cancelling your subscription
              before the renewal date if you no longer wish to continue. You will retain access to
              Pro features until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">How to Request a Refund</h2>
            <p>
              To request a refund, email us at{" "}
              <a href="mailto:privacy@tecpdf.com" className="text-foreground underline underline-offset-2 hover:no-underline">
                privacy@tecpdf.com
              </a>{" "}
              with your order details. We will process your refund within 5–10 business days.
              Refunds are issued to the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Payment Processing</h2>
            <p>
              Payments for Pro subscriptions are processed by Paddle.com Market Limited, our
              authorised reseller and Merchant of Record. Paddle handles all billing, invoicing,
              and refund processing on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
            <p>
              For any questions about this refund policy, please contact us at{" "}
              <a href="mailto:privacy@tecpdf.com" className="text-foreground underline underline-offset-2 hover:no-underline">
                privacy@tecpdf.com
              </a>.
            </p>
          </section>

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
            <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
            <span>·</span>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
