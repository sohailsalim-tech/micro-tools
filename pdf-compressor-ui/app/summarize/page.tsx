import { PdfSummarizer } from "@/components/pdf-summarizer";
import { JsonLd } from "@/components/json-ld";

export const metadata = {
  title: "PDF Summarizer – AI Summary of Any PDF Free",
  description: "Summarize any PDF instantly with AI. Get key points, main topics, and conclusions from reports, papers, and contracts in seconds. Free, no signup.",
};

export default function SummarizePage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "PDF Summarizer",
        "url": "https://tecpdf.com/summarize",
        "description": "AI-powered PDF summarizer. Get clear, concise summaries of any PDF document in seconds.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <PdfSummarizer />
    </>
  );
}
