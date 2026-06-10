import type { Metadata } from "next";
import { ProtectPdf } from "@/components/protect-pdf";

export const metadata: Metadata = {
  title: "Protect PDF – OPUS PDF Tools",
  description: "Add a password to your PDF to prevent unauthorised access. Free, fast, no signup.",
};

export default function ProtectPage() {
  return <ProtectPdf />;
}
