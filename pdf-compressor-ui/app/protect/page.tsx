import type { Metadata } from "next";
import { ProtectPdf } from "@/components/protect-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Protect PDF – OPUS Productivity Tools",
  description: "Add a password to your PDF to prevent unauthorised access. Free, fast, no signup.",
};

export default function ProtectPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Protect PDF",
        "url": "https://tecpdf.com/protect",
        "description": "Add a password to your PDF to prevent unauthorised access. Free, fast, no signup.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <ProtectPdf />
    </>
  );
}
