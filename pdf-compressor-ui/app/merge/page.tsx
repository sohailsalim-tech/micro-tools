import type { Metadata } from "next";
import { MergePdf } from "@/components/merge-pdf";

export const metadata: Metadata = {
  title: "Merge PDF – OPUS PDF Tools",
  description: "Combine multiple PDF files into one document. Free, fast, no signup.",
};

export default function MergePage() {
  return <MergePdf />;
}
