import { PdfChat } from "@/components/pdf-chat";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "Chat with PDF – Ask Questions About Any PDF Free",
  description: "Chat with your PDF using AI. Ask questions about any document — contracts, research papers, reports — and get instant accurate answers. Free, no signup.",
  alternates: { canonical: "https://tecpdf.com/chat" },
};

export default function ChatPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Chat with PDF",
        "url": "https://tecpdf.com/chat",
        "description": "AI-powered PDF chat tool. Ask questions about any PDF document and get instant answers.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <PdfChat />
    </>
  );
}
