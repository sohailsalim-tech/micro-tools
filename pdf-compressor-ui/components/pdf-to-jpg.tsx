"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";

type Status = "idle" | "info_loading" | "ready" | "converting" | "complete";
type Quality = "standard" | "high" | "max";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const qualityOptions: { value: Quality; label: string; dpi: string; description: string }[] = [
  { value: "standard", label: "Standard", dpi: "150 DPI", description: "Smaller files" },
  { value: "high",     label: "High",     dpi: "200 DPI", description: "Balanced"      },
  { value: "max",      label: "Max",      dpi: "300 DPI", description: "Full quality"  },
];

export function PdfToJpg() {
  const [file, setFile]             = useState<File | null>(null);
  const [pageCount, setPageCount]   = useState<number | null>(null);
  const [quality, setQuality]       = useState<Quality>("high");
  const [status, setStatus]         = useState<Status>("idle");
  const [progress, setProgress]     = useState(0);
  const [downloadUrl, setDownloadUrl]   = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("pdf_pages.zip");
  const [outputSize, setOutputSize]     = useState(0);
  const [resultPages, setResultPages]   = useState<number | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ── Convert ─────────────────────────────────────────────────────
  const handleConvert = useCallback(async () => {
    if (!file) return;
    setStatus("converting");
    setProgress(0);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("quality", quality);

      const uploadRes = await fetch(`${apiUrl}/pdf-to-jpg`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text().catch(() => "Upload failed"));
      const { job_id } = await uploadRes.json();
      setProgress(20);

      // Poll — GS rendering time scales with page count + DPI
      let pollProgress = 20;
      const tick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 0.35, 84);
        setProgress(Math.round(pollProgress));
      }, 1000);

      let finalSize  = 0;
      let finalPages: number | null = null;
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 1500));
        const res  = await fetch(`${apiUrl}/job/${job_id}`);
        const data = await res.json();
        if (data.status === "done") {
          finalSize  = data.output_size;
          finalPages = data.page_count ?? null;
          break;
        }
        if (data.status === "error") {
          clearInterval(tick);
          throw new Error(data.error || "Conversion failed");
        }
      }
      clearInterval(tick);
      setProgress(90);

      // Download
      const dlRes = await fetch(`${apiUrl}/download/${job_id}`);
      if (!dlRes.ok) throw new Error("Download failed");

      const disposition = dlRes.headers.get("Content-Disposition") || "";
      const fnMatch     = disposition.match(/filename="?([^"]+)"?/);
      const fname       = fnMatch?.[1] ?? (finalPages === 1 ? "page_0001.jpg" : "pdf_pages.zip");

      const blob = await dlRes.blob();
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadName(fname);
      setOutputSize(finalSize);
      setResultPages(finalPages);
      setProgress(100);
      setStatus("complete");

    } catch (err) {
      setProgress(0);
      setStatus("ready");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [file, quality, apiUrl]);

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPageCount(null);
    setStatus("idle");
    setProgress(0);
    setDownloadUrl(null);
    setOutputSize(0);
    setResultPages(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
  };

  const isZip = downloadName.endsWith(".zip");

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
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-3xl">📄</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">PDF to JPG</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Convert every page of a PDF into high-quality images</p>
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
                ${isDragging ? "border-rose-400 bg-rose-500/5 scale-[1.01]" : "border-border hover:border-rose-400 hover:bg-rose-500/5"}
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
              <p className="text-xs text-muted-foreground mt-1">Each page becomes a separate JPG image</p>
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

          {/* Ready + converting */}
          {(status === "ready" || status === "converting") && file && (
            <>
              {/* File info bar */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 mb-4">
                <span className="text-xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)}
                    {pageCount !== null && ` · ${pageCount} page${pageCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
                {status === "ready" && (
                  <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    ✕ Change
                  </button>
                )}
              </div>

              {/* Quality selector */}
              {status === "ready" && (
                <>
                  <label className="block text-xs font-medium text-foreground mb-2">Image quality</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {qualityOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`
                          relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all duration-150
                          ${quality === opt.value ? "border-rose-400 bg-rose-500/5" : "border-border hover:border-rose-300"}
                        `}
                      >
                        <input type="radio" name="quality" value={opt.value} checked={quality === opt.value}
                          onChange={() => setQuality(opt.value)} className="sr-only" />
                        <span className="font-medium text-xs text-foreground">{opt.label}</span>
                        <span className="text-[10px] text-rose-500/80 font-mono mt-0.5">{opt.dpi}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                        {quality === opt.value && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />}
                      </label>
                    ))}
                  </div>

                  {/* Info note */}
                  {pageCount !== null && pageCount > 1 && (
                    <p className="text-[11px] text-muted-foreground mb-4 text-center">
                      {pageCount} pages → {pageCount} JPG images bundled in a ZIP file
                    </p>
                  )}

                  {/* Convert button */}
                  <button
                    onClick={handleConvert}
                    className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition-all duration-150 shadow-md shadow-rose-500/25"
                  >
                    Convert{pageCount !== null ? ` ${pageCount} page${pageCount !== 1 ? "s" : ""}` : ""} to JPG
                  </button>
                </>
              )}

              {/* Progress */}
              {status === "converting" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      {progress < 20 ? "Uploading…" : progress >= 90 ? "Downloading…" : "Rendering pages…"}
                    </span>
                    <span className="text-xs font-medium text-rose-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }} />
                  </div>
                  {pageCount !== null && (
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Rendering {pageCount} page{pageCount !== 1 ? "s" : ""} — this may take a moment for large PDFs
                    </p>
                  )}
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 mb-4 text-3xl">
                🖼️
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {isZip ? "Images ready!" : "Image ready!"}
              </h2>
              <p className="text-sm text-muted-foreground mb-1">
                {resultPages !== null
                  ? `${resultPages} JPG image${resultPages !== 1 ? "s" : ""} · `
                  : ""}
                <span className="font-medium text-foreground">{formatFileSize(outputSize)}</span>
              </p>
              {isZip && (
                <p className="text-xs text-muted-foreground mb-4">ZIP contains one JPG per page</p>
              )}
              <div className={`flex flex-col gap-2 ${!isZip ? "mt-4" : ""}`}>
                <button onClick={handleDownload}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition-all shadow-md shadow-rose-500/25">
                  Download {isZip ? "ZIP" : "JPG"}
                </button>
                <button onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                  Convert another PDF
                </button>
              </div>
              <ShareBar toolUrl="/pdf-to-jpg" toolName="PDF to JPG on OPUS Productivity Tools" />
            </div>
          )}
        </div>

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
