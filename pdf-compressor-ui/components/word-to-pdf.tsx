"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";
import { useWittyMessages } from "@/hooks/use-witty-messages";

type Status = "idle" | "ready" | "converting" | "complete";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function WordToPdf() {
  const [file, setFile]             = useState<File | null>(null);
  const [status, setStatus]         = useState<Status>("idle");
  const [progress, setProgress]     = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wittyMsg = useWittyMessages([
    "Convincing Word to speak PDF…",
    "Translating from .docx to the universal language…",
    "Ironing out the formatting…",
    "Teaching paragraphs to sit still…",
    "Polishing the fonts…",
    "Telling tables to behave in PDF…",
    "Almost done — just fixing the page breaks…",
    "Converting like a pro…",
    "Your document is changing careers…",
    "From editable to eternal…",
  ], status === "converting");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const loadFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".doc") && !name.endsWith(".docx")) {
      setErrorMsg("Please select a .doc or .docx file.");
      return;
    }
    setFile(f);
    setStatus("ready");
    setErrorMsg(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus("converting");
    setProgress(0);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const uploadRes = await fetch(`${apiUrl}/word-to-pdf`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text().catch(() => "Upload failed"));
      const { job_id } = await uploadRes.json();
      setProgress(25);

      let pollProgress = 25;
      const tick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 0.5, 84);
        setProgress(Math.round(pollProgress));
      }, 800);

      let finalSize = 0;
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 1500));
        const res  = await fetch(`${apiUrl}/job/${job_id}`);
        const data = await res.json();
        if (data.status === "done")  { finalSize = data.output_size; break; }
        if (data.status === "error") { clearInterval(tick); throw new Error(data.error || "Conversion failed"); }
      }
      clearInterval(tick);
      setProgress(90);

      const dlRes = await fetch(`${apiUrl}/download/${job_id}`);
      if (!dlRes.ok) throw new Error("Download failed");
      const blob = await dlRes.blob();
      setDownloadUrl(URL.createObjectURL(blob));
      setOutputSize(finalSize);
      setProgress(100);
      setStatus("complete");

    } catch (err) {
      setProgress(0);
      setStatus("ready");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [file, apiUrl]);

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setDownloadUrl(null);
    setOutputSize(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = file.name.replace(/\.docx?$/i, ".pdf");
    a.click();
  };

  return (
    <main className="min-h-screen bg-background py-6 px-3 sm:py-12 sm:px-4">
      <div className="mx-auto max-w-[680px] w-full">

        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              ← All tools
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-3xl">📝</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Word to PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Convert .doc and .docx files to PDF instantly</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">

          {/* Upload zone */}
          {status === "idle" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging ? "border-blue-400 bg-blue-500/5 scale-[1.01]" : "border-border hover:border-blue-400 hover:bg-blue-500/5"}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-4xl mb-3">📝</div>
              <p className="font-medium text-sm text-foreground">Drop a Word file here or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">.doc and .docx supported</p>
            </div>
          )}

          {/* Ready state */}
          {(status === "ready" || status === "converting") && file && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-5">
                <span className="text-xl">📝</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                {status === "ready" && (
                  <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    ✕ Change
                  </button>
                )}
              </div>

              {status === "ready" && (
                <button
                  onClick={handleConvert}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-md shadow-primary/25"
                >
                  Convert to PDF
                </button>
              )}

              {status === "converting" && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      {progress < 25 ? "Uploading…" : wittyMsg}
                    </span>
                    <span className="text-xs font-medium text-primary">{progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{errorMsg}</p>
            </div>
          )}

          {/* Complete */}
          {status === "complete" && downloadUrl && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 mb-3">
                  <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Conversion complete!</h2>
                <p className="text-xs text-muted-foreground">PDF size: {formatFileSize(outputSize)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-md shadow-primary/25"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all duration-150 border border-border"
                >
                  Convert Another
                </button>
              </div>
              <ShareBar toolUrl="/word-to-pdf" toolName="Word to PDF on OPUS Productivity Tools" />
            </div>
          )}
        </div>

        {/* SEO content */}
        <section className="mt-8 sm:mt-12 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Convert Word to PDF online for free</h2>
            <p>OPUS Word to PDF converter turns your .doc and .docx files into perfectly formatted PDFs instantly — no Microsoft Office required. Whether you&apos;re sending a CV, a business proposal, or a report, converting to PDF ensures your formatting looks identical on every device and operating system.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">How does Word to PDF conversion work?</h2>
            <p>Upload your Word document and our server uses LibreOffice — a professional-grade document engine — to render it to PDF with full fidelity. Fonts, tables, images, headers, footers, and page layout are all preserved exactly as they appear in your original document. The conversion takes just a few seconds regardless of document length.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Your files stay private</h2>
            <p>Your Word document is processed on our secure server and permanently deleted as soon as your PDF is ready to download. We never read, store, or share the contents of your documents. Your work remains completely confidential.</p>
          </div>
        </section>

        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <span>🔒 Your files are never stored on our servers</span>
        </footer>
      </div>
    </main>
  );
}
