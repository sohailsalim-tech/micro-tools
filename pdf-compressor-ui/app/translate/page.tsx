import { PdfTranslator } from "@/components/pdf-translator";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "PDF Translator – Translate PDF to Any Language Free",
  description: "Translate PDF documents into Spanish, French, German, Chinese, Japanese, Arabic and more. Free AI-powered PDF translation online. No signup required.",
};

export default function TranslatePage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PDF Translator",
        "url": "https://tecpdf.com/translate",
        "description": "AI-powered PDF translator. Translate PDF documents into 10 languages instantly for free.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <PdfTranslator />
    </>
  );
}
