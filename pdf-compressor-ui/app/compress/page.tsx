import { PDFCompressor } from "@/components/pdf-compressor";

export const metadata = {
  title: "Compress PDF — OPUS Productivity Tools",
  description: "Reduce PDF file size by up to 90% for free. Fast, secure, no signup required.",
};

export default function CompressPage() {
  return <PDFCompressor />;
}
