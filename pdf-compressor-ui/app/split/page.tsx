import type { Metadata } from "next";
import { SplitPdf } from "@/components/split-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Split PDF – OPUS Productivity Tools",
  description: "Extract pages or split a PDF into multiple files. Free, fast, no signup.",
};

export default function SplitPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Split PDF",
        "url": "https://tecpdf.com/split",
        "description": "Extract pages or split a PDF into multiple files. Free, fast, no signup.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <SplitPdf />
    </>
  );
}
