"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";
import { useWittyMessages } from "@/hooks/use-witty-messages";

type Status = "idle" | "info_loading" | "ready" | "splitting" | "complete";
type Mode = "extract" | "ranges" | "all";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const modeOptions: { value: Mode; label: string; icon: string; description: string }[] = [
  {
    value: "extract",
    label: "Extract pages",
    icon: "📑",
    description: "Pick specific pages → get one PDF",
  },
  {
    value: "ranges",
    label: "Split by ranges",
    icon: "✂️",
    description: "Define chunks → get a ZIP of PDFs",
  },
  {
    value: "all",
    label: "Split all pages",
    icon: "📋",
    description: "Every page becomes its own PDF",
  },
];

export function SplitPdf() {
  const [file, setFile]           = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode]           = useState<Mode>("extract");
  const [spec, setSpec]           = useState("");
  const [status, setStatus]       = useState<Status>("idle");
  const [progress, setProgress]   = useState(0);
  const [downloadUrl, setDownloadUrl]     = useState<string | null>(null);
  const [downloadName, setDownloadName]   = useState("result.pdf");
  const [outputSize, setOutputSize]       = useState(0);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);
  const [isDragging, setIsDragging]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wittyMsg = useWittyMessages([
    "Performing precision page surgery…",
    "Carefully cutting along the dotted line…",
    "Separating pages like a pro…",
    "Giving each page its independence…",
    "Slicing and dicing digitally…",
    "Teaching pages to stand on their own…",
    "Almost done splitting…",
  ], status === "splitting");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ── File selection ──────────────────────────────────────────────
  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a PDF file.");
      return;
    }
    setFile(f);
    setStatus("info_loading");
    setErrorMsg(null);
    setPageCount(null);

    try {
      const form = new FormData();
      form.append("file", f, f.name);
      const res  = await fetch(`${apiUrl}/pdf-info`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not read PDF");
      setPageCount(data.page_count);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not read PDF");
      setStatus("idle");
      setFile(null);
    }
  }, [apiUrl]);

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

  // ── Split ───────────────────────────────────────────────────────
  const handleSplit = useCallback(async () => {
    if (!file) return;
    setStatus("splitting");
    setProgress(0);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("mode", mode);
      formData.append("spec", spec);

      const uploadRes = await fetch(`${apiUrl}/split-pdf`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text().catch(() => "Upload failed"));
      const { job_id } = await uploadRes.json();
      setProgress(25);

      // Poll
      let pollProgress = 25;
      const tick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 0.6, 84);
        setProgress(Math.round(pollProgress));
      }, 700);

      let finalSize  = 0;
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 1200));
        const res  = await fetch(`${apiUrl}/job/${job_id}`);
        const data = await res.json();
        if (data.status === "done")  { finalSize = data.output_size; break; }
        if (data.status === "error") { clearInterval(tick); throw new Error(data.error || "Split failed"); }
      }
      clearInterval(tick);
      setProgress(90);

      // Download
      const dlRes  = await fetch(`${apiUrl}/download/${job_id}`);
      if (!dlRes.ok) throw new Error("Download failed");

      // Detect filename from Content-Disposition or derive from mode
      const disposition = dlRes.headers.get("Content-Disposition") || "";
      const fnMatch     = disposition.match(/filename="?([^"]+)"?/);
      const fname       = fnMatch?.[1] ?? (mode === "extract" ? "extracted.pdf" : mode === "all" ? "split_pages.zip" : "split_parts.zip");

      const blob = await dlRes.blob();
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(fname);
      setOutputSize(finalSize);
      setProgress(100);
      setStatus("complete");

    } catch (err) {
      setProgress(0);
      setStatus("ready");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [file, mode, spec, apiUrl]);

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPageCount(null);
    setStatus("idle");
    setProgress(0);
    setDownloadUrl(null);
    setOutputSize(0);
    setErrorMsg(null);
    setSpec("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
  };

  const isZip      = downloadName.endsWith(".zip");
  const canSplit   = status === "ready" && file !== null && (mode === "all" || spec.trim().length > 0);

  return (
    <main className="min-h-screen bg-background py-6 px-3 sm:py-12 sm:px-4">
      <div className="mx-auto max-w-[680px] w-full">

        {/* Back + Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              ← All tools
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-3xl">✂️</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Split PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Extract pages or split a PDF into multiple files</p>
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
                ${isDragging ? "border-orange-400 bg-orange-500/5 scale-[1.01]" : "border-border hover:border-orange-400 hover:bg-orange-500/5"}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-4xl mb-3">📄</div>
              <p className="font-medium text-sm text-foreground">Drop a PDF here or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">Single PDF file</p>
            </div>
          )}

          {/* Loading page count */}
          {status === "info_loading" && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="animate-spin">⏳</span> Reading PDF…
              </div>
            </div>
          )}

          {/* Ready state — file loaded */}
          {(status === "ready" || status === "splitting") && file && (
            <>
              {/* File info bar */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 mb-4">
                <span className="text-xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)}{pageCount !== null ? ` · ${pageCount} page${pageCount !== 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                {status === "ready" && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    ✕ Change
                  </button>
                )}
              </div>

              {/* Mode selector */}
              {status === "ready" && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {modeOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`
                        relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all duration-150
                        ${mode === opt.value ? "border-orange-400 bg-orange-500/5" : "border-border hover:border-orange-300"}
                      `}
                    >
                      <input type="radio" name="mode" value={opt.value} checked={mode === opt.value}
                        onChange={() => setMode(opt.value)} className="sr-only" />
                      <span className="text-lg mb-1">{opt.icon}</span>
                      <span className="font-medium text-[11px] text-foreground leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{opt.description}</span>
                      {mode === opt.value && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />}
                    </label>
                  ))}
                </div>
              )}

              {/* Spec input */}
              {status === "ready" && mode === "extract" && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Pages to extract
                    {pageCount !== null && (
                      <span className="text-muted-foreground font-normal ml-1">(1–{pageCount})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                    placeholder={`e.g. 1, 3, 5-8${pageCount ? `, 10-${pageCount}` : ""}`}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-400 transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Use commas to separate pages, hyphens for ranges (e.g. <code className="font-mono">1, 3, 5-8</code>)
                  </p>
                </div>
              )}

              {status === "ready" && mode === "ranges" && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Page ranges
                    {pageCount !== null && (
                      <span className="text-muted-foreground font-normal ml-1">(1–{pageCount})</span>
                    )}
                  </label>
                  <textarea
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                    placeholder={`e.g. 1-5; 6-10; 11-${pageCount ?? "15"}`}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-400 transition-colors resize-none font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Separate each part with a semicolon <code className="font-mono">;</code> — each part becomes its own PDF in a ZIP
                  </p>
                </div>
              )}

              {status === "ready" && mode === "all" && pageCount !== null && (
                <div className="mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/15 text-center">
                  <p className="text-xs text-muted-foreground">
                    This will create <span className="font-semibold text-foreground">{pageCount} individual PDFs</span> bundled in a ZIP file.
                  </p>
                </div>
              )}

              {/* Split button */}
              {status === "ready" && (
                <button
                  onClick={handleSplit}
                  disabled={!canSplit}
                  className={`
                    w-full py-3 rounded-lg font-semibold text-sm text-white
                    transition-all duration-150
                    ${canSplit
                      ? "bg-orange-500 hover:bg-orange-600 active:scale-[0.98] shadow-md shadow-orange-500/25"
                      : "bg-orange-300 cursor-not-allowed opacity-60"}
                  `}
                >
                  {mode === "all" ? `Split into ${pageCount ?? "all"} pages` : "Split PDF"}
                </button>
              )}

              {/* Progress */}
              {status === "splitting" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      {progress < 25 ? "Uploading…" : progress >= 90 ? "Preparing download…" : wittyMsg}
                    </span>
                    <span className="text-xs font-medium text-orange-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }} />
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
          {status === "complete" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/10 mb-4 text-3xl">
                ✅
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {isZip ? "ZIP ready!" : "PDF ready!"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Output size: <span className="font-medium text-foreground">{formatFileSize(outputSize)}</span>
                {isZip && <span className="block text-xs mt-0.5 text-muted-foreground">Contains multiple PDF files</span>}
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleDownload}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-500/25">
                  Download {isZip ? "ZIP" : "PDF"}
                </button>
                <button onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                  Split another PDF
                </button>
              </div>
              <ShareBar toolUrl="/split" toolName="Split PDF on OPUS Productivity Tools" />
            </div>
          )}
        </div>

        {/* SEO content */}
        <section className="mt-8 sm:mt-12 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Split PDF files online for free</h2>
            <p>OPUS PDF Splitter lets you divide any PDF into separate pages or extract specific page ranges — all online, no software needed. Perfect for extracting a single chapter from a book, separating invoices, or isolating specific pages from a large document.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">How does PDF splitting work?</h2>
            <p>Upload your PDF and choose how to split it — extract all pages as individual files, or specify a custom page range. Our server processes your document instantly using industry-standard PDF tools, preserving all content, images, and formatting in every output file.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Your files stay private</h2>
            <p>Your uploaded PDF is processed on our secure server and deleted immediately after your download is ready. We never read, store, or share your files. What&apos;s in your PDF stays between you and your device.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5">
            <Image src="/opus-logo.png" alt="OPUS" width={14} height={14} className="opacity-40" />
            <span>OPUS Productivity Tools</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
