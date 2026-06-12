import type { Metadata } from "next";
import { WordToPdf } from "@/components/word-to-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Word to PDF Online Free – Convert DOCX to PDF",
  description: "Convert Word documents (.doc, .docx) to PDF online for free. Fast, accurate conversion with formatting preserved. No signup required.",
};

export default function WordToPdfPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Word to PDF",
        "url": "https://tecpdf.com/word-to-pdf",
        "description": "Convert Word documents (.doc, .docx) to PDF instantly. Free, fast, no signup required.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <WordToPdf />
    </>
  );
}
