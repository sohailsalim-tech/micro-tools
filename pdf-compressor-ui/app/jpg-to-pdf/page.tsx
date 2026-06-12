import { JpgToPdf } from "@/components/jpg-to-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "JPG to PDF Online Free – Convert Images to PDF",
  description: "Convert JPG, PNG and other images to PDF online for free. Combine multiple photos into one PDF instantly. No signup required.",
};

export default function JpgToPdfPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "JPG to PDF",
        "url": "https://tecpdf.com/jpg-to-pdf",
        "description": "Combine multiple images into one compressed PDF album for free. Fast, secure, no signup.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <JpgToPdf />
    </>
  );
}
