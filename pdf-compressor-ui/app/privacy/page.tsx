import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for OPUS Productivity Tools (tecpdf.com). Learn how we handle your files and data.",
  alternates: { canonical: "https://tecpdf.com/privacy" },
};

const EFFECTIVE_DATE = "June 14, 2026 (updated June 14, 2026)";
const CONTACT_EMAIL = "privacy@tecpdf.com";
const SITE_URL = "https://tecpdf.com";

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <div className="prose prose-sm sm:prose max-w-none text-foreground space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              OPUS Productivity Tools operates the website{" "}
              <a href={SITE_URL} className="text-foreground underline underline-offset-2 hover:no-underline">
                tecpdf.com
              </a>{" "}
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We provide free online PDF tools including
              compressing, merging, splitting, protecting, converting, and AI-powered summarization of PDF
              files. This Privacy Policy explains what information we collect, how we use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>

            <h3 className="text-base font-semibold text-foreground mb-2">Files You Upload</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              When you use our standard tools (Compress, Merge, Split, Protect, Convert), you upload files
              to our servers for processing. <strong className="text-foreground">We do not store, read,
              share, or retain your files.</strong> Files are processed immediately and deleted as soon as
              your download is ready. We never access the content of your documents for these tools.
            </p>
            <h3 className="text-base font-semibold text-foreground mb-2">PDF Summarizer — AI Processing</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The <strong className="text-foreground">PDF Summarizer</strong> tool works differently. When
              you upload a PDF for summarization, we extract the text content from your document and send
              it to <strong className="text-foreground">Anthropic, Inc.</strong> (the maker of Claude AI)
              via their secure API to generate a summary. The extracted text is sent solely to produce your
              summary and is not stored by us or used by Anthropic to train AI models. Your original PDF
              file is deleted from our server immediately after text extraction. Anthropic&apos;s handling
              of API data is governed by their{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Privacy Policy
              </a>
              . Do not upload confidential or sensitive documents to the PDF Summarizer tool.
            </p>

            <h3 className="text-base font-semibold text-foreground mb-2">Usage Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We automatically collect certain technical information when you visit our site, including
              your IP address, browser type, operating system, referring URLs, pages visited, and the
              date and time of your visit. This data is used solely to operate and improve the service.
            </p>

            <h3 className="text-base font-semibold text-foreground mb-2">Cookies and Tracking Technologies</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies for analytics and advertising purposes, as
              described below. You can control cookies through your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>To process and return your files using our PDF tools</li>
              <li>To operate, maintain, and improve the website</li>
              <li>To understand how users interact with our tools (analytics)</li>
              <li>To serve relevant advertisements (Google AdSense)</li>
              <li>To detect and prevent fraudulent or abusive usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>

            <h3 className="text-base font-semibold text-foreground mb-2">Anthropic (Claude AI)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our PDF Summarizer tool uses the Claude AI API provided by Anthropic, Inc. When you use the
              PDF Summarizer, the text extracted from your PDF is transmitted to Anthropic&apos;s servers
              to generate a summary. Anthropic does not use API inputs or outputs to train their AI models
              under their standard API usage policy. Data is transmitted over encrypted HTTPS connections.
              For more information, see{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Anthropic&apos;s Privacy Policy
              </a>
              .
            </p>

            <h3 className="text-base font-semibold text-foreground mb-2">Google AdSense</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use Google AdSense to display advertisements on our site. Google AdSense uses cookies
              to serve ads based on your prior visits to our website and other sites on the internet.
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on
              your visit to our site and/or other sites. You may opt out of personalised advertising by
              visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Google Ads Settings
              </a>
              . For more information on how Google uses data, please visit{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </p>

            <h3 className="text-base font-semibold text-foreground mb-2">Google Analytics</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use Google Analytics to understand how visitors use our site. Google Analytics collects
              information such as how often you visit the site, what pages you visit, and what other sites
              you used prior to coming to ours. We use this information only to improve our service. Google
              Analytics collects only the IP address assigned to you on the date you visit, not your name
              or other personally identifying information. You can opt out of Google Analytics by installing
              the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Google Analytics opt-out browser add-on
              </a>
              .
            </p>

            <h3 className="text-base font-semibold text-foreground mb-2">Vercel Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our site is hosted on Vercel. Vercel may collect anonymised usage statistics. No personally
              identifiable information is shared with Vercel through this integration. For details, see{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                Vercel&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Uploaded files</strong> are deleted from our processing
              servers immediately after your download is prepared — typically within seconds. We retain
              no copies. Server access logs (IP address, request metadata) may be retained for up to
              30 days for security and diagnostic purposes. Analytics data is retained as per Google&apos;s
              standard retention policies (up to 26 months).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We only share
              data with service providers as described in Section 4 (Anthropic, Google AdSense, Google
              Analytics, Vercel), and only as necessary to operate the service. Specifically, document
              text is shared with Anthropic only when you use the PDF Summarizer tool. We may disclose
              information if required by law or to protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights (GDPR &amp; Privacy Laws)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you are located in the European Economic Area (EEA), United Kingdom, or other
              jurisdictions with applicable privacy laws, you have the following rights:
            </p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Right to access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong className="text-foreground">Right to rectification</strong> — request correction of inaccurate data</li>
              <li><strong className="text-foreground">Right to erasure</strong> — request deletion of your personal data</li>
              <li><strong className="text-foreground">Right to restrict processing</strong> — request that we limit how we use your data</li>
              <li><strong className="text-foreground">Right to object</strong> — object to processing based on our legitimate interests</li>
              <li><strong className="text-foreground">Right to data portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong className="text-foreground">Right to withdraw consent</strong> — withdraw consent at any time where we rely on consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Since we do not create user accounts or store personally identifiable information, the data
              we hold is limited to server logs and analytics data described above. To exercise your
              rights, please contact us using the email address in Section 10.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. California Privacy Rights (CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a California resident, you have the right to know what personal information we
              collect, to request deletion of your personal information, and to opt out of the sale of
              your personal information. We do not sell personal information. To exercise your rights,
              contact us at the email address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not directed to children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe
              your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your data rights,
              please contact us at:
            </p>
            <p className="mt-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-foreground font-medium underline underline-offset-2 hover:no-underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will revise the
              effective date at the top of this page. We encourage you to review this policy periodically
              to stay informed about how we protect your information.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to tools
          </Link>
          <span>© {new Date().getFullYear()} OPUS Productivity Tools</span>
        </div>
      </div>
    </main>
  );
}
