import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TecPDF — Free PDF Tools Online";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background grid dots */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          display: "flex",
        }} />

        {/* Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: "linear-gradient(135deg, #3B82F6, #6366F1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
          }}>
            📄
          </div>
          <span style={{ fontSize: 56, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-2px" }}>
            TecPDF
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 26, color: "#94A3B8", margin: "0 0 48px", textAlign: "center", maxWidth: 700 }}>
          Free PDF Tools — Compress, Merge, Split, Protect & Convert
        </p>

        {/* Tool chips */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
          {["🗜️ Compress", "🔗 Merge", "✂️ Split", "🔒 Protect", "🖼️ JPG → PDF", "📄 PDF → JPG"].map((t) => (
            <div key={t} style={{
              background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 999, padding: "8px 20px", fontSize: 18, color: "#93C5FD",
              display: "flex",
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div style={{
          position: "absolute", bottom: 40,
          fontSize: 18, color: "#475569", letterSpacing: "0.05em",
          display: "flex",
        }}>
          tecpdf.com
        </div>
      </div>
    ),
    { ...size }
  );
}
