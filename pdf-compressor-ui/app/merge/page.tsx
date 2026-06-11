import type { Metadata } from "next";
import { MergePdf } from "@/components/merge-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Merge PDF – OPUS Productivity Tools",
  description: "Combine multiple PDF files into one document. Free, fast, no signup.",
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
