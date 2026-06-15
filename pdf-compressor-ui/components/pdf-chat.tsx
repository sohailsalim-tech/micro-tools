"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Status  = "idle" | "loading" | "chatting" | "error";
type Message = { role: "user" | "assistant"; content: string };

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const LOADING_MSGS = [
  "Reading your PDF…",
  "Extracting text from pages…",
  "Preparing your document…",
  "Almost ready to chat…",
];

export function PdfChat() {
  const [status,     setStatus]     = useState<Status>("idle");
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [pageCount,  setPageCount]  = useState(0);
  const [wordCount,  setWordCount]  = useState(0);
  const [fileName,   setFileName]   = useState("");
  const [fileSize,   setFileSize]   = useState(0);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef      = useRef<HTMLTextAreaElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const loadFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a PDF file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMsg("File too large. Maximum size is 5 MB.");
      return;
    }
    setErrorMsg(null);
    uploadPdf(f);
  };

  const uploadPdf = async (f: File) => {
    setStatus("loading");
    setFileName(f.name);
    setFileSize(f.size);
    setLoadingIdx(0);

    loadingTimer.current = setInterval(() => {
      setLoadingIdx((i) => (i + 1) % LOADING_MSGS.length);
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("file", f, f.name);

      const res  = await fetch(`${apiUrl}/chat-pdf/start`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to process PDF");

      setSessionId(data.session_id);
      setPageCount(data.pages);
      setWordCount(data.word_count);
      setMessages([]);
      setStatus("chatting");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    }
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking || !sessionId) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("messages", JSON.stringify(newMessages));

      const res  = await fetch(`${apiUrl}/chat-pdf/message`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Chat failed");

      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (err) {
      setMessages([...newMessages, {
        role: "assistant",
        content: `Sorry, something went wrong: ${err instanceof Error ? err.message : "Please try again."}`,
      }]);
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  }, [input, isThinking, sessionId, messages, apiUrl]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setSessionId(null);
    setMessages([]);
    setInput("");
    setFileName("");
    setFileSize(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-background py-6 px-3 sm:py-12 sm:px-4">
      <div className="mx-auto max-w-[720px] w-full">

        {/* Page header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              ← All tools
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-3xl">💬</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Chat with PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Ask any question about your PDF — AI answers instantly</p>
            </div>
          </div>
        </div>

        {/* Upload — idle */}
        {status === "idle" && (
          <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragging ? "border-teal-400 bg-teal-500/5 scale-[1.01]" : "border-border hover:border-teal-400 hover:bg-teal-500/5"}
              `}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
                className="sr-only"
              />
              <div className="text-4xl mb-3">💬</div>
              <p className="font-medium text-sm text-foreground">Drop a PDF here or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">Free · Text-based PDFs only · Up to 20 questions per session</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">📦 Max 5 MB</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">📄 Max 20 pages</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-1 rounded-full">⏱️ 3 PDFs / hour</span>
              </div>
            </div>
            {errorMsg && (
              <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive">{errorMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="bg-card rounded-xl shadow-lg border border-border p-8 text-center">
            <div className="text-4xl mb-4 animate-pulse">📄</div>
            <p className="text-sm font-medium text-foreground mb-1">{fileName}</p>
            <p className="text-xs text-muted-foreground mb-4">{formatFileSize(fileSize)}</p>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span className="animate-spin text-base">⏳</span>
              <span>{LOADING_MSGS[loadingIdx]}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
              <div className="h-full bg-teal-500 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
              <p className="text-xs text-destructive">{errorMsg}</p>
            </div>
            <button onClick={handleReset}
              className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border">
              Try another file
            </button>
          </div>
        )}

        {/* Chat interface */}
        {status === "chatting" && (
          <div className="bg-card rounded-xl shadow-lg border border-border flex flex-col" style={{ height: "600px" }}>

            {/* PDF info bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-teal-500/5 rounded-t-xl flex-shrink-0">
              <span className="text-lg">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{fileName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {pageCount} page{pageCount !== 1 ? "s" : ""} · ~{wordCount.toLocaleString()} words
                </p>
              </div>
              <button onClick={handleReset}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 border border-border rounded-md px-2 py-1">
                New PDF
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm font-medium text-foreground mb-1">Your PDF is ready</p>
                  <p className="text-xs text-muted-foreground">Ask anything about it below</p>
                  <div className="mt-5 flex flex-col gap-2 max-w-xs mx-auto">
                    {["What is this document about?", "Summarise the key points", "What are the main conclusions?"].map((q) => (
                      <button key={q} onClick={() => setInput(q)}
                        className="text-xs text-left px-3 py-2 rounded-lg border border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 text-teal-700 dark:text-teal-300 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`
                    max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-border"
                    }
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex-shrink-0">
              {messages.length >= 20 && (
                <p className="text-[11px] text-muted-foreground text-center mb-2">
                  Session limit reached (20 messages). <button onClick={handleReset} className="underline hover:text-foreground">Start a new chat</button>
                </p>
              )}
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your PDF…"
                  rows={1}
                  disabled={isThinking || messages.length >= 20}
                  className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 min-h-[42px] max-h-32"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking || messages.length >= 20}
                  className="h-[42px] w-[42px] rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Press Enter to send · Shift+Enter for new line · {10 - Math.floor(messages.length / 2)} messages remaining
              </p>
            </div>
          </div>
        )}

        {/* SEO content */}
        {(status === "idle" || status === "error") && (
          <section className="mt-8 sm:mt-12 space-y-6 text-sm text-muted-foreground">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-2">Chat with any PDF — free, no signup</h2>
              <p>OPUS Chat with PDF lets you have a real conversation with your document. Upload a research paper, legal contract, report, or manual and ask questions in plain English. Get instant, accurate answers without reading every page.</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground mb-2">How does PDF chat work?</h2>
              <p>Your PDF is uploaded to our secure server, text is extracted from each page, and processed by our AI engine. You can then ask unlimited questions within your session. The AI reads the entire document and answers based solely on its content.</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground mb-2">Your files stay private</h2>
              <p>Your PDF is processed on our secure server and permanently deleted after your session ends. Extracted text is only used to answer your questions and is never stored, shared, or used for AI training.</p>
            </div>
          </section>
        )}

        <footer className="mt-5 text-center text-xs text-muted-foreground">
          <span>🔒 Your files are never stored · AI-powered</span>
        </footer>
      </div>
    </main>
  );
}
