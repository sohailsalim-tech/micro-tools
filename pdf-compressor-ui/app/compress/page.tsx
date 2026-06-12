import { PDFCompressor } from "@/components/pdf-compressor";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "Compress PDF Online Free – Reduce PDF Size Up to 90%",
  description: "Compress PDF files online for free. Reduce file size by up to 90% without losing quality. No signup, no limits, works on any device.",
};

export default function CompressPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Compress PDF",
        "url": "https://tecpdf.com/compress",
        "description": "Reduce PDF file size by up to 90% for free. Fast, secure, no signup required.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <PDFCompressor />
    </>
  );
}
