"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

type CompressionLevel = "screen" | "ebook" | "printer" | "prepress";
type Status = "idle" | "selected" | "compressing" | "complete";

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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function OpusLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/opus-logo.png"
      alt="OPUS Suite Logo"
      width={48}
      height={48}
      className={className}
    />
  );
}

function AstralTechIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/astral-tech-logo.png"
      alt="Astral Tech"
      width={24}
      height={24}
      className={className}
    />
  );
}

export function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("ebook");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setStatus("selected");
      setResult(null);
      setProgress(0);
    }
  }, []);

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

  const simulateCompression = useCallback(() => {
    if (!file) return;

    setStatus("compressing");
    setProgress(0);

    const reductionRates: Record<CompressionLevel, number> = {
      screen: 0.85,
      ebook: 0.65,
      printer: 0.35,
      prepress: 0.1,
    };

    const duration = 2500;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        const reduction = reductionRates[compressionLevel];
        const compressedSize = file.size * (1 - reduction);
        setResult({
          originalSize: file.size,
          compressedSize,
          reduction: reduction * 100,
        });
        setStatus("complete");
      }
    }, interval);
  }, [file, compressionLevel]);

  const handleReset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDownload = useCallback(() => {
    // Simulate download - in real app, this would download the compressed file
    alert("In a real application, this would download your compressed PDF!");
  }, []);

  return (
    <main className="min-h-screen bg-background py-4 px-3 sm:py-16 sm:px-4">
      <div className="mx-auto max-w-[600px] w-full">
        {/* Header */}
        <header className="mb-5 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <OpusLogo className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2 tracking-tight">
              OPUS PDF Compressor
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg leading-tight">
              Compress PDF files up to 90% • Free &amp; Instant
            </p>
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-8">
          {/* Upload Area */}
          {status !== "complete" && (
            <div
              onClick={() => fileInputRef.current?.click()}
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
                ${status === "compressing" ? "pointer-events-none opacity-50" : ""}
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
              onClick={simulateCompression}
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
                  Compressing...
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
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
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-accent">
                    <span className="text-base">↓</span>
                    {Math.round(result.reduction)}% smaller
                  </span>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-5 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
            <ShieldIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="line-clamp-1">Your privacy is protected. No files stored.</span>
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <AstralTechIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Powered by Astral Tech</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
