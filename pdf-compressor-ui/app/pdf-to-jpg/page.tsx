import type { Metadata } from "next";
import { PdfToJpg } from "@/components/pdf-to-jpg";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "PDF to JPG – OPUS Productivity Tools",
  description: "Convert every page of a PDF into high-quality JPG images. Free, fast, no signup.",
};

export default function PdfToJpgPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PDF to JPG",
        "url": "https://tecpdf.com/pdf-to-jpg",
        "description": "Convert every page of a PDF into high-quality JPG images. Free, fast, no signup.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <PdfToJpg />
    </>
  );
}
