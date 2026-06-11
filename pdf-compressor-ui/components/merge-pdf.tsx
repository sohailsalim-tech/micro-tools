"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";
import { useWittyMessages } from "@/hooks/use-witty-messages";

type Status = "idle" | "selected" | "merging" | "complete";

type PdfFile = {
  id: string;
  file: File;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function MergePdf() {
  const [pdfs, setPdfs]               = useState<PdfFile[]>([]);
  const [status, setStatus]           = useState<Status>("idle");
  const [progress, setProgress]       = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize]   = useState(0);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wittyMsg = useWittyMessages([
    "Introducing the PDFs to each other…",
    "Building bridges between documents…",
    "Convincing pages to become one big family…",
    "Stapling things digitally…",
    "Performing a document wedding…",
    "Merging timelines…",
    "Almost one happy PDF…",
  ], status === "merging");
  const dragSrcId    = useRef<string | null>(null);

  // ── File selection ──────────────────────────────────────────────
  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newPdfs: PdfFile[] = [];
    Array.from(fileList).forEach((f) => {
      if (!f.name.toLowerCase().endsWith(".pdf")) return;
      newPdfs.push({ id: crypto.randomUUID(), file: f });
    });
    setPdfs((prev) => [...prev, ...newPdfs]);
    setStatus("selected");
    setErrorMsg(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removePdf = (id: string) => {
    setPdfs((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) setStatus("idle");
      else if (next.length === 1) setStatus("selected");
      return next;
    });
  };

  // ── Drag-to-reorder ─────────────────────────────────────────────
  const onDragStart = (id: string) => { dragSrcId.current = id; };
  const onDragOver  = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const onDragEnd   = () => { dragSrcId.current = null; setDragOverId(null); };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const srcId = dragSrcId.current;
    if (!srcId || srcId === targetId) { setDragOverId(null); return; }
    setPdfs((prev) => {
      const arr  = [...prev];
      const from = arr.findIndex((x) => x.id === srcId);
      const to   = arr.findIndex((x) => x.id === targetId);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setDragOverId(null);
  };

  // ── Merge ───────────────────────────────────────────────────────
  const handleMerge = useCallback(async () => {
    if (pdfs.length < 2) return;
    setStatus("merging");
    setProgress(0);
    setErrorMsg(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      // Phase 1: upload
      const formData = new FormData();
      pdfs.forEach((p) => formData.append("files", p.file, p.file.name));

      const uploadRes = await fetch(`${apiUrl}/merge-pdf`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text().catch(() => "Upload failed"));
      const { job_id } = await uploadRes.json();
      setProgress(25);

      // Phase 2: poll
      let pollProgress = 25;
      const tick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 0.5, 84);
        setProgress(Math.round(pollProgress));
      }, 800);

      let finalSize = 0;
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 1200));
        const res  = await fetch(`${apiUrl}/job/${job_id}`);
        const data = await res.json();
        if (data.status === "done")  { finalSize = data.output_size; break; }
        if (data.status === "error") { clearInterval(tick); throw new Error(data.error || "Merge failed"); }
      }
      clearInterval(tick);
      setProgress(90);

      // Phase 3: download
      const dlRes = await fetch(`${apiUrl}/download/${job_id}`);
      if (!dlRes.ok) throw new Error("Download failed");
      const blob = await dlRes.blob();
      setDownloadUrl(URL.createObjectURL(blob));
      setOutputSize(finalSize);
      setProgress(100);
      setStatus("complete");

    } catch (err) {
      setProgress(0);
      setStatus("selected");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [pdfs]);

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setPdfs([]);
    setStatus("idle");
    setProgress(0);
    setDownloadUrl(null);
    setOutputSize(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "merged.pdf";
    a.click();
  };

  const totalInputSize = pdfs.reduce((s, p) => s + p.file.size, 0);

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
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-3xl">🔗</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Merge PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Combine multiple PDFs into one document</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">

          {/* Upload zone — only show when not complete */}
          {status !== "complete" && (
            <>
              <div
                onClick={() => status !== "merging" && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragging ? "border-emerald-400 bg-emerald-500/5 scale-[1.01]" : "border-border hover:border-emerald-400 hover:bg-emerald-500/5"}
                  ${status === "merging" ? "pointer-events-none opacity-40" : ""}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-3xl mb-2">📁</div>
                <p className="font-medium text-sm text-foreground">
                  {pdfs.length > 0 ? "Add more PDFs" : "Drop PDF files here or click to select"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF files only • Multiple files supported</p>
              </div>

              {/* PDF list with drag-to-reorder */}
              {pdfs.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {pdfs.length} file{pdfs.length !== 1 ? "s" : ""} • drag to reorder
                    </p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(totalInputSize)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {pdfs.map((pdf, idx) => (
                      <div
                        key={pdf.id}
                        draggable
                        onDragStart={() => onDragStart(pdf.id)}
                        onDragOver={(e) => onDragOver(e, pdf.id)}
                        onDragEnd={onDragEnd}
                        onDrop={(e) => onDrop(e, pdf.id)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-grab active:cursor-grabbing
                          transition-all duration-150 bg-background/50
                          ${dragOverId === pdf.id ? "border-emerald-400 bg-emerald-500/5 scale-[1.01]" : "border-border hover:border-emerald-300"}
                          ${status === "merging" ? "pointer-events-none" : ""}
                        `}
                      >
                        {/* Page number badge */}
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {/* PDF icon */}
                        <span className="text-base flex-shrink-0">📄</span>
                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{pdf.file.name}</p>
                          <p className="text-[10px] text-muted-foreground">{formatFileSize(pdf.file.size)}</p>
                        </div>
                        {/* Drag handle */}
                        <span className="text-muted-foreground/40 select-none text-sm flex-shrink-0">⠿</span>
                        {/* Remove */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removePdf(pdf.id); }}
                          className="flex-shrink-0 w-5 h-5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-[11px] flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
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

          {/* Need at least 2 hint */}
          {pdfs.length === 1 && status !== "merging" && (
            <p className="mt-3 text-xs text-center text-muted-foreground">
              Add at least one more PDF to merge
            </p>
          )}

          {/* Merge button */}
          {pdfs.length >= 2 && status === "selected" && (
            <button
              onClick={handleMerge}
              className="w-full mt-4 py-3 rounded-lg font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all duration-150 shadow-md shadow-emerald-500/25"
            >
              Merge {pdfs.length} PDFs into one
            </button>
          )}

          {/* Progress */}
          {status === "merging" && (
            <div className="mt-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  {progress < 25 ? "Uploading…" : progress >= 90 ? "Preparing download…" : wittyMsg}
                </span>
                <span className="text-xs font-medium text-emerald-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Complete */}
          {status === "complete" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mb-4 text-3xl">
                ✅
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">PDFs merged!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {pdfs.length} files → <span className="font-medium text-foreground">{formatFileSize(outputSize)}</span>
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleDownload}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md shadow-emerald-500/25">
                  Download merged.pdf
                </button>
                <button onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                  Merge more files
                </button>
              </div>
              <ShareBar toolUrl="/merge" toolName="Merge PDF on OPUS Productivity Tools" />
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
