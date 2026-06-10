import type { Metadata } from "next";
import { PdfToJpg } from "@/components/pdf-to-jpg";

export const metadata: Metadata = {
  title: "PDF to JPG – OPUS Productivity Tools",
  description: "Convert every page of a PDF into high-quality JPG images. Free, fast, no signup.",
};

export default function PdfToJpgPage() {
  return <PdfToJpg />;
}
