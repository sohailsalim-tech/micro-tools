"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Status = "idle" | "ready" | "protecting" | "complete";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function PasswordStrength({ password }: { password: string }) {
  const len   = password.length;
  const score =
    len === 0 ? 0 :
    len < 6   ? 1 :
    len < 10 && !/[^a-zA-Z0-9]/.test(password) ? 2 :
    len >= 10 && /[^a-zA-Z0-9]/.test(password)  ? 4 : 3;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const textColors = ["", "text-red-500", "text-yellow-500", "text-blue-500", "text-green-500"];

  if (len === 0) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-muted"}`} />
        ))}
      </div>
      <span className={`text-[10px] font-medium flex-shrink-0 ${textColors[score]}`}>{labels[score]}</span>
    </div>
  );
}

export function ProtectPdf() {
  const [file, setFile]             = useState<File | null>(null);
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus]         = useState<Status>("idle");
  const [progress, setProgress]     = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const passwordsMatch = password.length > 0 && password === confirm;
  const canProtect     = status === "ready" && file !== null && passwordsMatch;

  // ── File selection ──────────────────────────────────────────────
  const loadFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a PDF file.");
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

  // ── Protect ─────────────────────────────────────────────────────
  const handleProtect = useCallback(async () => {
    if (!file || !passwordsMatch) return;
    setStatus("protecting");
    setProgress(0);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("password", password);

      const uploadRes = await fetch(`${apiUrl}/protect-pdf`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text().catch(() => "Upload failed"));
      const { job_id } = await uploadRes.json();
      setProgress(30);

      // Poll — pypdf encrypt is fast, usually sub-second
      let pollProgress = 30;
      const tick = setInterval(() => {
        pollProgress = Math.min(pollProgress + 1.5, 84);
        setProgress(Math.round(pollProgress));
      }, 500);

      let finalSize = 0;
      while (true) {
        await new Promise<void>((r) => setTimeout(r, 800));
        const res  = await fetch(`${apiUrl}/job/${job_id}`);
        const data = await res.json();
        if (data.status === "done")  { finalSize = data.output_size; break; }
        if (data.status === "error") { clearInterval(tick); throw new Error(data.error || "Encryption failed"); }
      }
      clearInterval(tick);
      setProgress(90);

      // Download
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
  }, [file, password, passwordsMatch, apiUrl]);

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setPassword("");
    setConfirm("");
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
    a.download = "protected.pdf";
    a.click();
  };

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
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-3xl">🔒</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Protect PDF</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Add a password to prevent unauthorised access</p>
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
                ${isDragging ? "border-sky-400 bg-sky-500/5 scale-[1.01]" : "border-border hover:border-sky-400 hover:bg-sky-500/5"}
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

          {/* Ready + protecting state */}
          {(status === "ready" || status === "protecting") && file && (
            <>
              {/* File info bar */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 mb-5">
                <span className="text-xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
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

              {/* Password fields */}
              {status === "ready" && (
                <>
                  {/* Password */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Set password
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                        autoComplete="new-password"
                        className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sky-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                        tabIndex={-1}
                      >
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  {/* Confirm password */}
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className={`
                          w-full px-3 py-2.5 pr-10 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors
                          ${confirm.length > 0
                            ? passwordsMatch ? "border-green-400 focus:border-green-400" : "border-red-400 focus:border-red-400"
                            : "border-border focus:border-sky-400"}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                        tabIndex={-1}
                      >
                        {showConfirm ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {confirm.length > 0 && !passwordsMatch && (
                      <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>
                    )}
                    {passwordsMatch && (
                      <p className="text-[10px] text-green-500 mt-1">✓ Passwords match</p>
                    )}
                  </div>

                  {/* Info note */}
                  <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-border mb-4 text-xs text-muted-foreground">
                    <span className="flex-shrink-0">ℹ️</span>
                    <span>The password will be required to open this PDF. Keep it safe — it cannot be recovered if lost.</span>
                  </div>

                  {/* Protect button */}
                  <button
                    onClick={handleProtect}
                    disabled={!canProtect}
                    className={`
                      w-full py-3 rounded-lg font-semibold text-sm text-white transition-all duration-150
                      ${canProtect
                        ? "bg-sky-500 hover:bg-sky-600 active:scale-[0.98] shadow-md shadow-sky-500/25"
                        : "bg-sky-300 cursor-not-allowed opacity-60"}
                    `}
                  >
                    🔒 Protect PDF
                  </button>
                </>
              )}

              {/* Progress */}
              {status === "protecting" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      {progress < 30 ? "Uploading…" : progress >= 90 ? "Downloading…" : "Encrypting…"}
                    </span>
                    <span className="text-xs font-medium text-sky-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full transition-all duration-300 ease-out"
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
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-500/10 mb-4 text-3xl">
                🔒
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">PDF protected!</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Password-locked · <span className="font-medium text-foreground">{formatFileSize(outputSize)}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Anyone opening this file will need the password you set.
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleDownload}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition-all shadow-md shadow-sky-500/25">
                  Download protected.pdf
                </button>
                <button onClick={handleReset}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-secondary-foreground bg-secondary hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                  Protect another PDF
                </button>
              </div>
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
