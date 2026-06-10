"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Status = "idle" | "selected" | "compressing" | "complete";

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

type CompressionLevel = "screen" | "ebook" | "printer";

const compressionOptions: { value: CompressionLevel; label: string; description: string }[] = [
  { value: "screen",  label: "Small",  description: "Max compression" },
  { value: "ebook",   label: "Medium", description: "Balanced" },
  { value: "printer", label: "Large",  description: "High quality" },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function JpgToPdf() {
  const [images, setImages]           = useState<ImageFile[]>([]);
  const [status, setStatus]           = useState<Status>("idle");
  const [progress, setProgress]       = useState(0);
  const [level, setLevel]             = useState<CompressionLevel>("screen");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize]   = useState(0);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragSrcId    = useRef<string | null>(null);

  // ── File selection ──────────────────────────────────────────────
  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
    const newImgs: ImageFile[] = [];
    Array.from(fileList).forEach((f) => {
      if (!ALLOWED.includes(f.type)) return;
      newImgs.push({ id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) });
    });
    setImages((prev) => [...prev, ...newImgs]);
    setStatus("selected");
    setErrorMsg(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (next.length === 0) setStatus("idle");
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
    setImages((prev) => {
      const arr  = [...prev];
      const from = arr.findIndex((x) => x.id === srcId);
      const to   = arr.findIndex((x) => x.id === targetId);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setDragOverId(null);
  };

  // ── Compress & combine ──────────────────────────────────────────
  const handleConvert = useCallback(async () => {
    if (images.length === 0) return;
    setStatus("compressing");
    setProgress(0);
    setErrorMsg(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      // Phase 1: upload
      const formData = new FormData();
      images.forEach((img) => formData.append("files", img.file, img.file.name));
      formData.append("level", level);

      const uploadRes = await fetch(`${apiUrl}/jpg-to-pdf`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text().catch(() => "Upload failed"));
      const { job_id } = await uploadRes.json();
      setProgress(20);

      // Phase 2: poll
      let pollProgress = 20;
      const tick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 0.4, 84);
        setProgress(Math.round(pollProgress));
      }, 1000);

      let finalSize = 0;
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 1500));
        const res  = await fetch(`${apiUrl}/job/${job_id}`);
        const data = await res.json();
        if (data.status === "done")  { finalSize = data.output_size; break; }
        if (data.status === "error") { clearInterval(tick); throw new Error(data.error || "Failed"); }
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
  }, [images, level]);

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setImages([]);
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
    a.download = "album.pdf";
    a.click();
  };

  const totalInputSize = images.reduce((s, img) => s + img.file.size, 0);

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
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl">🖼️</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">JPG to PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Combine images into one compressed PDF album</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">

          {/* Upload zone — only show when not complete */}
          {status !== "complete" && (
            <>
              <div
                onClick={() => status !== "compressing" && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragging ? "border-violet-400 bg-violet-500/5 scale-[1.01]" : "border-border hover:border-violet-400 hover:bg-violet-500/5"}
                  ${status === "compressing" ? "pointer-events-none opacity-40" : ""}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
                  multiple
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-3xl mb-2">📁</div>
                <p className="font-medium text-sm text-foreground">
                  {images.length > 0 ? "Add more images" : "Drop images here or click to select"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP supported • Multiple files</p>
              </div>

              {/* Image grid with drag-to-reorder */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {images.length} image{images.length !== 1 ? "s" : ""} • drag to reorder
                    </p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(totalInputSize)}</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => onDragStart(img.id)}
                        onDragOver={(e) => onDragOver(e, img.id)}
                        onDragEnd={onDragEnd}
                        onDrop={(e) => onDrop(e, img.id)}
                        className={`
                          relative group rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing
                          transition-all duration-150
                          ${dragOverId === img.id ? "border-violet-400 scale-105" : "border-border"}
                          ${status === "compressing" ? "pointer-events-none" : ""}
                        `}
                      >
                        <div className="aspect-square relative bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.preview}
                            alt={img.file.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Page number */}
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </div>
                          {/* Remove button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate px-1.5 py-1">
                          {img.file.name}
                        </p>
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

          {/* Quality selector */}
          {(status === "selected" || status === "idle") && images.length > 0 && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-foreground mb-2">Output Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {compressionOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`
                      relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all duration-150
                      ${level === opt.value ? "border-violet-400 bg-violet-500/5" : "border-border hover:border-violet-300"}
                    `}
                  >
                    <input type="radio" name="level" value={opt.value} checked={level === opt.value}
                      onChange={() => setLevel(opt.value)} className="sr-only" />
                    <span className="font-medium text-xs text-foreground">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</span>
                    {level === opt.value && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Convert button */}
          {status === "selected" && images.length > 0 && (
            <button
              onClick={handleConvert}
              className="w-full mt-4 py-3 rounded-lg font-semibold text-sm text-white bg-violet-500 hover:bg-violet-600 active:scale-[0.98] transition-all duration-150 shadow-md shadow-violet-500/25"
            >
              Combine {images.length} image{images.length !== 1 ? "s" : ""} into PDF
            </button>
          )}

          {/* Progress */}
          {status === "compressing" && (
            <div className="mt-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  {progress < 20 ? "Uploading…" : progress >= 90 ? "Downloading…" : "Creating PDF…"}
                </span>
                <span className="text-xs font-medium text-violet-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Complete */}
          {status === "complete" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-500/10 mb-4 text-3xl">
                ✅
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">PDF created!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {images.length} images → <span className="font-medium text-foreground">{formatFileSize(outputSize)}</span>
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleDownload}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-violet-500 hover:bg-violet-600 active:scale-[0.98] transition-all shadow-md shadow-violet-500/25">
                  Download PDF
                </button>
                <button onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                  Make another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Image src="/astral-tech-logo.png" alt="Astral Tech" width={14} height={14} />
            <span>Powered by Astral Hatch Technologies</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
