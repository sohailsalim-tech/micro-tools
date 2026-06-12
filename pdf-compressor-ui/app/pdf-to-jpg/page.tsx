import type { Metadata } from "next";
import { PdfToJpg } from "@/components/pdf-to-jpg";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "PDF to JPG Online Free – Convert PDF Pages to Images",
  description: "Convert PDF pages to high-quality JPG images online for free. Download all pages as a ZIP or get a single image. No signup required.",
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
