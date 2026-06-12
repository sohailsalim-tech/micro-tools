import type { Metadata } from "next";
import { MergePdf } from "@/components/merge-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Merge PDF Online Free – Combine PDF Files Into One",
  description: "Merge multiple PDF files into one document online for free. Drag, drop and combine PDFs instantly. No signup, no limits.",
};

export default function MergePage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Merge PDF",
        "url": "https://tecpdf.com/merge",
        "description": "Combine multiple PDF files into one document. Free, fast, no signup.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <MergePdf />
    </>
  );
}
