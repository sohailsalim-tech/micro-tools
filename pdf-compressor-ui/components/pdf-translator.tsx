"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareBar } from "@/components/share-bar";

type Status = "idle" | "ready" | "translating" | "complete" | "error";

const LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Chinese (Simplified)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Italian",
];

const WITTY = [
  "Crossing language borders…",
  "Teaching your PDF new words…",
  "Translating page by page…",
  "Finding the right words…",
  "Almost fluent now…",
  "Polishing the translation…",
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function PdfTranslator() {
  const [file, setFile]               = useState<File | null>(null);
  const [status, setStatus]           = useState<Status>("idle");
  const [targetLang, setTargetLang]   = useState<string>("Spanish");
  const [translation, setTranslation] = useState<string>("");
  const [pages, setPages]             = useState<number>(0);
  const [wordCount, setWordCount]     = useState<number>(0);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [wittyIdx, setWittyIdx]       = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wittyTimer   = useRef<ReturnType<typeof setInterval> | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const loadFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a PDF file.");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setErrorMsg("File too large. Maximum size is 3 MB.");
      return;
    }
    setFile(f);
    setStatus("ready");
    setErrorMsg(null);
    setTranslation("");
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

  const handleTranslate = useCallback(async () => {
    if (!file) return;
    setStatus("translating");
    setErrorMsg(null);
    setWittyIdx(0);

    wittyTimer.current = setInterval(() => {
      setWittyIdx((i) => (i + 1) % WITTY.length);
    }, 2500);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("target_language", targetLang);

      const res  = await fetch(`${apiUrl}/translate`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Translation failed");

      setTranslation(data.translation);
      setPages(data.pages);
      setWordCount(data.word_count);
      setStatus("complete");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      if (wittyTimer.current) clearInterval(wittyTimer.current);
    }
  }, [file, targetLang, apiUrl]);

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setTranslation("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
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
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-3xl">🌐</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">PDF Translator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Translate any PDF into 10 languages instantly with AI</p>
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
                ${isDragging ? "border-amber-400 bg-amber-500/5 scale-[1.01]" : "border-border hover:border-amber-400 hover:bg-amber-500/5"}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-4xl mb-3">🌐</div>
              <p className="font-medium text-sm text-foreground">Drop a PDF here or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">Text-based PDFs only</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">📦 Max 3 MB</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">📄 Max 10 pages</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">⏱️ 2 / hour</span>
              </div>
            </div>
          )}

          {(status === "ready" || status === "translating") && file && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
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
                <>
                  <label className="block text-xs font-medium text-foreground mb-2">Translate to</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {LANGUAGES.map((lang) => (
                      <label
                        key={lang}
                        className={`
                          flex items-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all duration-150 text-xs
                          ${targetLang === lang ? "border-amber-400 bg-amber-500/5 font-medium text-foreground" : "border-border hover:border-amber-300 text-muted-foreground"}
                        `}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={lang}
                          checked={targetLang === lang}
                          onChange={() => setTargetLang(lang)}
                          className="sr-only"
                        />
                        {targetLang === lang && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                        {targetLang !== lang && <span className="w-2 h-2 rounded-full border border-border flex-shrink-0" />}
                        {lang}
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleTranslate}
                    className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all duration-150 shadow-md shadow-amber-500/25"
                  >
                    Translate to {targetLang}
                  </button>
                </>
              )}

              {status === "translating" && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="animate-spin text-base">⏳</span>
                    <span>{WITTY[wittyIdx]}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">Translation takes 10–30 seconds depending on document length</p>
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

          {status === "complete" && translation && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-semibold text-foreground">Translated to {targetLang}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{pages} page{pages !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>~{wordCount.toLocaleString()} words</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4 max-h-96 overflow-y-auto space-y-3">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <div className="bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-lg px-3 py-2 font-bold text-sm mt-2 first:mt-0">{children}</div>
                    ),
                    h2: ({ children }) => (
                      <div className="bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg px-3 py-2 font-semibold text-sm mt-2 first:mt-0">{children}</div>
                    ),
                    h3: ({ children }) => (
                      <div className="border-l-2 border-amber-400 pl-3 py-0.5 font-semibold text-sm text-foreground mt-2">{children}</div>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-foreground/90 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 pl-0 list-none">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-1 pl-4 list-decimal">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                  }}
                >
                  {translation}
                </ReactMarkdown>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopy}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all duration-150 shadow-md shadow-amber-500/25"
                >
                  Copy Translation
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all duration-150 border border-border"
                >
                  Translate Another PDF
                </button>
              </div>
              <ShareBar toolUrl="/translate" toolName="PDF Translator on OPUS Productivity Tools" />
            </div>
          )}
        </div>

        <section className="mt-8 sm:mt-12 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Translate PDF to any language free online</h2>
            <p>OPUS PDF Translator uses AI to translate your PDF documents into 10 major languages instantly. Upload a contract, report, article, or any text-based PDF and get a clean, accurate translation you can copy and use — no signup, no software needed.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">How does AI PDF translation work?</h2>
            <p>Your PDF is uploaded to our secure server where text is extracted from each page and processed by our AI translation engine. The AI understands context and produces natural, fluent translations — not word-for-word substitutions. Paragraphs and structure are preserved as closely as possible in the translated output.</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Your files stay private</h2>
            <p>Your PDF is processed on our secure server and permanently deleted immediately after translation. The extracted text is sent to our AI engine to generate the translation and is not stored or shared with third parties. Your documents remain completely confidential.</p>
          </div>
        </section>

        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <span>🔒 Your files are never stored · AI-powered</span>
        </footer>
      </div>
    </main>
  );
}
