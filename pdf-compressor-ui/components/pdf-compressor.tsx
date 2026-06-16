"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";
import { useWittyMessages } from "@/hooks/use-witty-messages";

type CompressionLevel = "screen" | "ebook" | "printer" | "prepress";
type Status = "idle" | "selected" | "compressing" | "complete" | "error";

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  reduction: number;
}

const compressionOptions: {
  value: CompressionLevel;
  label: string;
  description: string;
}[] = [
  { value: "screen", label: "Screen", description: "Max compression" },
  { value: "ebook", label: "eBook", description: "Medium" },
  { value: "printer", label: "Printer", description: "Low" },
  { value: "prepress", label: "Prepress", description: "None" },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("ebook");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressedFileUrl, setCompressedFileUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wittyMsg = useWittyMessages([
    "Convincing your PDF to go on a diet…",
    "Squeezing pixels into submission…",
    "Negotiating with bytes…",
    "Removing unnecessary calories…",
    "Teaching the PDF to travel light…",
    "Applying digital liposuction…",
    "Making it fit into those jeans…",
    "Telling redundant data to pack its bags…",
    "Asking pixels to share rooms…",
    "Compressing like there's no tomorrow…",
    "Filing down the rough edges…",
    "Every byte counts — trimming the fat…",
    "Your PDF is sweating it out at the gym…",
    "Performing document yoga…",
    "Shrinking it smaller than your inbox…",
    "Packing everything into a tiny suitcase…",
    "The PDF is almost beach-body ready…",
    "Evicting duplicate data from the premises…",
    "Running a byte reduction marathon…",
    "Convincing fonts to stop hogging space…",
    "Politely asking images to step aside…",
    "Optimising like a Swiss engineer…",
    "Putting the PDF through boot camp…",
    "Whispering sweet nothings to the compressor…",
    "Making pixels uncomfortable so they leave…",
    "Your document is getting a serious makeover…",
    "Applying extreme couponing to file size…",
    "Removing pixels that nobody asked for…",
    "Running a background audit on every byte…",
    "The PDF is almost unrecognisably slim…",
    "Trimming white space like a bonsai master…",
    "Hunting down bloated metadata…",
    "The server is doing its very best…",
    "Fewer bytes, same information — magic!",
    "Doing what email attachments only dream of…",
    "Pushing data through a very small hole…",
    "Your patience is greatly appreciated…",
    "Good things take time — great files take more…",
    "Still here, still squeezing…",
    "The finish line is closer than it feels…",
    "Telling your PDF it has trust issues with whitespace…",
    "Deploying the shrink ray — stand back…",
    "Calculating the minimum number of pixels needed for dignity…",
    "Your file is visiting a compression spa…",
    "Renegotiating every byte's contract…",
    "Quietly removing pixels that were just loitering…",
    "Folding the document like origami…",
    "Putting the PDF on a juice cleanse…",
    "Shaking out the digital crumbs…",
    "Interrogating each layer for redundancy…",
    "Teaching the file to do more with less…",
    "Consulting the ancient art of Zip Fu…",
    "The bytes are being individually counselled…",
    "Politely evicting the freeloading metadata…",
    "Your document is having an existential crisis — in a good way…",
    "Making it lighter than your last email…",
    "Negotiating a cease-fire between resolution and size…",
    "Compressing like the deadline was yesterday…",
    "Applying algorithmic tough love…",
    "Running a full byte background check…",
    "Telling pixels to work smarter, not harder…",
    "The PDF is in therapy, learning to let go…",
    "Trimming the digital beard one pixel at a time…",
    "Coaxing the file size downward with jazz hands…",
    "Our server is flexing its compression muscles…",
    "Auditing the font collection for overcrowding…",
    "Removing the bits that were just for show…",
    "Packing the PDF like a professional traveller…",
    "Convincing every image it doesn't need that much resolution…",
    "The compressor is humming a focused little tune…",
    "Squeezing in the final few bytes…",
    "Giving the file a slimmer silhouette…",
    "Filing the paperwork to reduce the paperwork…",
    "Pixels negotiating severance packages…",
    "One last squeeze — almost there…",
    "Checking for stray semicolons hiding kilobytes…",
    "This PDF will be unrecognisably efficient…",
    "Wrapping up — the slim version is nearly ready…",
    "Almost done — resist the urge to refresh…",
  ], status === "compressing", 7000);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setStatus("selected");
      setResult(null);
      setProgress(0);
      setErrorMessage(null);
      if (compressedFileUrl) {
        URL.revokeObjectURL(compressedFileUrl);
        setCompressedFileUrl(null);
      }
    }
  }, [compressedFileUrl]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null;
      handleFileSelect(selectedFile);
    },
    [handleFileSelect]
  );

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setStatus("compressing");
    setProgress(0);
    setErrorMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      // ── Phase 1: Upload with real progress (0 → 18%) ──
      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", compressionLevel);

      const uploadRes = await fetch(`${apiUrl}/compress`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => "Unknown error");
        throw new Error(errorText);
      }

      const { job_id } = await uploadRes.json();
      setProgress(20);

      // ── Phase 2: Poll until Ghostscript finishes (20 → 85%) ──
      let pollProgress = 20;
      const pollTick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 0.4, 84);
        setProgress(Math.round(pollProgress));
      }, 1000);

      let inputSize  = 0;
      let outputSize = 0;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 800));

        const statusRes = await fetch(`${apiUrl}/job/${job_id}`);
        if (!statusRes.ok) throw new Error("Failed to check job status");
        const statusData = await statusRes.json();

        if (statusData.status === "done") {
          inputSize  = statusData.input_size;
          outputSize = statusData.output_size;
          break;
        }
        if (statusData.status === "error") {
          clearInterval(pollTick);
          throw new Error(statusData.error || "Compression failed");
        }
      }

      clearInterval(pollTick);
      setProgress(90);

      // ── Phase 3: Download the result (90 → 100%) ──
      const downloadRes = await fetch(`${apiUrl}/download/${job_id}`);
      if (!downloadRes.ok) throw new Error("Download failed");

      const blob = await downloadRes.blob();
      const url  = URL.createObjectURL(blob);

      setProgress(100);
      setCompressedFileUrl(url);
      setResult({
        originalSize:   inputSize,
        compressedSize: outputSize,
        reduction: ((inputSize - outputSize) / inputSize) * 100,
      });
      setStatus("complete");

    } catch (err) {
      setProgress(0);
      setStatus("selected");
      setErrorMessage(
        err instanceof Error ? err.message : "Compression failed. Please try again."
      );
    }
  }, [file, compressionLevel]);

  const handleReset = useCallback(() => {
    if (compressedFileUrl) {
      URL.revokeObjectURL(compressedFileUrl);
    }
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setCompressedFileUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [compressedFileUrl]);

  const handleDownload = useCallback(() => {
    if (!compressedFileUrl) return;
    const a = document.createElement("a");
    a.href = compressedFileUrl;
    a.download = file ? `compressed_${file.name}` : "compressed.pdf";
    a.click();
  }, [compressedFileUrl, file]);

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
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-3xl">🗜️</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Compress PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Reduce PDF file size by up to 90% — free &amp; instant</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">
          {/* Upload Area */}
          {status !== "complete" && (
            <div
              onClick={() => status !== "compressing" && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-4 sm:p-12 text-center cursor-pointer
                transition-all duration-200 ease-out
                ${isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-primary/40 hover:border-primary hover:bg-primary/5"
                }
                ${status === "compressing" ? "pointer-events-none opacity-50 cursor-default" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="sr-only"
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm sm:text-base text-balance line-clamp-2">{file.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      Drag PDF here or click to select
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      PDF files only
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs sm:text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Quality Selector */}
          {(status === "selected" || status === "idle") && (
            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">
                Compression Level
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {compressionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      relative flex flex-col p-3 sm:p-4 rounded-lg border-2 cursor-pointer
                      transition-all duration-150
                      ${compressionLevel === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="compression"
                      value={option.value}
                      checked={compressionLevel === option.value}
                      onChange={() => setCompressionLevel(option.value)}
                      className="sr-only"
                    />
                    <span className="font-medium text-foreground text-xs sm:text-sm">
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </span>
                    {compressionLevel === option.value && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Compress Button */}
          {status === "selected" && (
            <button
              onClick={handleCompress}
              className="
                w-full mt-4 sm:mt-6 py-3 sm:py-3.5 px-6 rounded-lg font-semibold text-sm sm:text-base text-primary-foreground
                bg-primary hover:bg-primary/90 active:scale-[0.98]
                transition-all duration-150 shadow-md shadow-primary/25
              "
            >
              Compress PDF
            </button>
          )}

          {/* Progress Section */}
          {status === "compressing" && (
            <div className="mt-4 sm:mt-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {progress < 20 ? "Uploading…" : wittyMsg}
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results Section */}
          {status === "complete" && result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/10 mb-3 sm:mb-4">
                  <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                  Compression complete!
                </h2>
              </div>

              {/* Size Comparison */}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <div className="text-center flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                      Original
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-foreground truncate">
                      {formatFileSize(result.originalSize)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-0.5 bg-border" />
                    <span className="text-muted-foreground text-sm">→</span>
                    <div className="w-4 h-0.5 bg-border" />
                  </div>
                  <div className="text-center flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                      Compressed
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-accent truncate">
                      {formatFileSize(result.compressedSize)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border text-center">
                  {result.reduction > 1 ? (
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-accent">
                      <span className="text-base">↓</span>
                      {Math.round(result.reduction)}% smaller
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-foreground">
                      <span className="text-base">✓</span>
                      Already optimised — original returned
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <button
                  onClick={handleDownload}
                  className="
                    w-full py-3 sm:py-3.5 px-6 rounded-lg font-semibold text-sm sm:text-base text-primary-foreground
                    bg-primary hover:bg-primary/90 active:scale-[0.98]
                    transition-all duration-150 shadow-md shadow-primary/25
                  "
                >
                  Download PDF
                </button>
                <button
                  onClick={handleReset}
                  className="
                    w-full py-3 sm:py-3.5 px-6 rounded-lg font-semibold text-sm sm:text-base text-secondary-foreground
                    bg-secondary hover:bg-secondary/80 active:scale-[0.98]
                    transition-all duration-150 border border-border
                  "
                >
                  Compress Another
                </button>
              </div>
              <ShareBar toolUrl="/compress" toolName="Compress PDF on OPUS Productivity Tools" />
            </div>
          )}
        </div>

        {/* SEO content */}
        <section className="mt-8 sm:mt-12 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Compress PDF files online for free</h2>
            <p>OPUS PDF Compressor reduces your PDF file size by up to 90% without requiring any software installation. Whether you need to send a PDF by email, upload it to a portal with a file size limit, or simply save storage space, our free online compressor gets the job done in seconds.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">How does PDF compression work?</h2>
            <p>Our compressor uses Ghostscript — the industry-standard PDF processing engine — to intelligently downsample images, remove redundant data, and optimise fonts inside your document. You choose the compression level: Screen for maximum size reduction, eBook for a balance of quality and size, Printer for print-ready output, or Prepress for professional publishing.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Your files stay private</h2>
            <p>We process your PDF on our secure server and delete it immediately after you download the result. We never store, share, or analyse your files. Your documents stay yours.</p>
          </div>
        </section>

        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <span>🔒 Your files are never stored</span>
        </footer>
      </div>
    </main>
  );
}
