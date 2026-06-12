import type { Metadata } from "next";
import { ExcelToPdf } from "@/components/excel-to-pdf";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Excel to PDF Online Free – Convert XLSX to PDF",
  description: "Convert Excel spreadsheets (.xls, .xlsx) to PDF online for free. All sheets, tables and formatting preserved. No signup required.",
};

export default function ExcelToPdfPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Excel to PDF",
        "url": "https://tecpdf.com/excel-to-pdf",
        "description": "Convert Excel spreadsheets (.xls, .xlsx) to PDF instantly. Free, fast, no signup required.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OPUS Productivity Tools", "url": "https://tecpdf.com" },
      }} />
      <ExcelToPdf />
    </>
  );
}
