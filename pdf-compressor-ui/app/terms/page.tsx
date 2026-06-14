import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for OPUS Productivity Tools (tecpdf.com).",
  alternates: { canonical: "https://tecpdf.com/terms" },
};

const EFFECTIVE_DATE = "June 14, 2026";
const CONTACT_EMAIL = "privacy@tecpdf.com";

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using tecpdf.com (&quot;the Service&quot;), operated by OPUS Productivity Tools
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              OPUS Productivity Tools provides free online PDF processing tools including compressing,
              merging, splitting, protecting, and converting files. The Service is provided &quot;as is&quot;
              and is intended for personal and professional use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>Upload files containing malware, viruses, or malicious code</li>
              <li>Process files that you do not own or have permission to use</li>
              <li>Attempt to overload, disrupt, or interfere with the Service</li>
              <li>Use automated scripts or bots to access the Service at scale</li>
              <li>Violate any applicable local, national, or international law</li>
              <li>Upload content that is illegal, harmful, or infringes third-party rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. File Uploads & Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Files you upload are processed solely to perform the requested operation and are
              deleted immediately after your download is ready. We do not store, read, share, or
              retain your files. You retain full ownership of all files you upload. By uploading
              a file, you confirm you have the right to do so.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, code, and content, is owned by OPUS Productivity Tools
              and protected by intellectual property laws. You may not copy, reproduce, or distribute
              any part of the Service without our prior written consent. Your uploaded files and
              processed outputs remain your property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided <strong className="text-foreground">&quot;as is&quot; and &quot;as available&quot;</strong> without
              warranties of any kind, either express or implied. We do not warrant that the Service
              will be uninterrupted, error-free, or that processed files will meet your specific
              requirements. Use the Service at your own risk. Always keep a backup of your original files.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, OPUS Productivity Tools shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, including
              loss of data, files, or profits arising from your use of the Service. Our total
              liability for any claim shall not exceed the amount you paid us in the past 12 months
              (which for free users is $0).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service uses third-party services including Google AdSense, Google Analytics,
              and Vercel. These services have their own terms and privacy policies. We are not
              responsible for the practices of these third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service at any time
              without notice. We are not liable to you or any third party for any modification,
              suspension, or discontinuation of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws.
              Any disputes arising from these Terms or the Service shall be resolved through
              good-faith negotiation before pursuing legal remedies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. Continued use of the Service after changes
              constitutes acceptance of the new Terms. We will update the effective date above
              when changes are made.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these Terms? Contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-2 hover:no-underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">← Back to tools</Link>
          <span>© {new Date().getFullYear()} OPUS Productivity Tools</span>
        </div>
      </div>
    </main>
  );
}
