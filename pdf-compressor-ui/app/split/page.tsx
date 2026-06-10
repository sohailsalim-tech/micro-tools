import type { Metadata } from "next";
import { SplitPdf } from "@/components/split-pdf";

export const metadata: Metadata = {
  title: "Split PDF – OPUS PDF Tools",
  description: "Extract pages or split a PDF into multiple files. Free, fast, no signup.",
};

export default function SplitPage() {
  return <SplitPdf />;
}
