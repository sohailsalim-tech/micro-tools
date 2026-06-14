"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";

type Status = "idle" | "ready" | "summarizing" | "complete" | "error";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const WITTY = [
  "Reading between the lines…",
  "Teaching AI to speed-read…",
  "Distilling wisdom from pages…",
  "Extracting the good stuff…",
  "Summarizing so you don't have to…",
  "Almost there — polishing the summary…",
];

export function PdfSummarizer() {
  const [file, setFile]         = useState<File | null>(null);
  const [status, setStatus]     = useState<Status>("idle");
  const [summary, setSummary]   = useState<string>("");
  const [pages, setPages]       = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [wittyIdx, setWittyIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wittyTimer   = useRef<ReturnType<typeof setInterval> | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const loadFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a PDF file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMsg("File too large. Maximum size is 5 MB.");
      return;
    }
    setFile(f);
    setStatus("ready");
    setErrorMsg(null);
    setSummary("");
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

  const handleSummarize = useCallback(async () => {
    if (!file) return;
    setStatus("summarizing");
    setErrorMsg(null);
    setWittyIdx(0);

    wittyTimer.current = setInterval(() => {
      setWittyIdx((i) => (i + 1) % WITTY.length);
    }, 2000);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await fetch(`${apiUrl}/summarize`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Summarization failed");

      setSummary(data.summary);
      setPages(data.pages);
      setWordCount(data.word_count);
      setStatus("complete");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      if (wittyTimer.current) clearInterval(wittyTimer.current);
    }
  }, [file, apiUrl]);

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setSummary("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
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
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-3xl">🧠</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">PDF Summarizer</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Get an AI-powered summary of any PDF in seconds</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">

          {status === "idle" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragging ? "border-violet-400 bg-violet-500/5 scale-[1.01]" : "border-border hover:border-violet-400 hover:bg-violet-500/5"}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-4xl mb-3">🧠</div>
              <p className="font-medium text-sm text-foreground">Drop a PDF here or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">Max 5 MB · Max 20 pages · Text-based PDFs only</p>
            </div>
          )}

          {(status === "ready" || status === "summarizing") && file && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 mb-5">
                <span className="text-xl">📄</span>
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
                  onClick={handleSummarize}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-violet-600 hover:bg-violet-700 active:scale-[0.98] transition-all duration-150 shadow-md shadow-violet-500/25"
                >
                  Summarize PDF
                </button>
              )}

              {status === "summarizing" && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="animate-spin text-base">⏳</span>
                    <span>{WITTY[wittyIdx]}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-violet-500 rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              )}
            </>
          )}

          {errorMsg && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{errorMsg}</p>
              {status === "error" && (
                <button onClick={handleReset} className="mt-2 text-xs text-muted-foreground hover:text-foreground underline">
                  Try another file
                </button>
              )}
            </div>
          )}

          {status === "complete" && summary && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-semibold text-foreground">Summary ready</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{pages} page{pages !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>~{wordCount.toLocaleString()} words read</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border mb-4 max-h-96 overflow-y-auto">
                {summary}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopy}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-violet-600 hover:bg-violet-700 active:scale-[0.98] transition-all duration-150 shadow-md shadow-violet-500/25"
                >
                  Copy Summary
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all duration-150 border border-border"
                >
                  Summarize Another PDF
                </button>
              </div>
              <ShareBar toolUrl="/summarize" toolName="PDF Summarizer on OPUS Productivity Tools" />
            </div>
          )}
        </div>

        <section className="mt-8 sm:mt-12 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Summarize any PDF with AI — free</h2>
            <p>OPUS PDF Summarizer uses Claude AI to read your document and deliver a clear, structured summary in seconds. Upload a report, research paper, contract, or any PDF and get the key points without reading every page.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">How does AI PDF summarization work?</h2>
            <p>Your PDF is uploaded to our secure server, text is extracted from each page, and sent to Claude — one of the most capable AI models available — which identifies the main topics, key findings, and conclusions. The result is a concise, bullet-pointed summary you can copy and use immediately.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Your files stay private</h2>
            <p>Your PDF is processed on our secure server and permanently deleted immediately after summarization. The extracted text is sent to the AI model to generate the summary and is not stored or used for training. We never share your documents with third parties.</p>
          </div>
        </section>

        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <span>🔒 Your files are never stored · AI-powered by Claude</span>
        </footer>
      </div>
    </main>
  );
}
