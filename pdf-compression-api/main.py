from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
import subprocess
import tempfile
import os
import shutil
import uuid
import threading
import time
from typing import List
from PIL import Image
from pypdf import PdfWriter, PdfReader
import zipfile
import io

app = FastAPI(title="OPUS PDF Compressor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://micro-tools-eosin.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    expose_headers=["X-Original-Size", "X-Compressed-Size"],
)

VALID_LEVELS = {"/screen", "/ebook", "/printer", "/prepress"}

LEVEL_PARAMS: dict[str, list[str]] = {
    "/screen": [
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=72",
        "-dAutoFilterColorImages=false",
        "-dColorImageFilter=/DCTEncode",
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=72",
        "-dAutoFilterGrayImages=false",
        "-dGrayImageFilter=/DCTEncode",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=72",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dDetectDuplicateImages=true",
    ],
    "/ebook": [
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=150",
        "-dAutoFilterColorImages=false",
        "-dColorImageFilter=/DCTEncode",
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=150",
        "-dAutoFilterGrayImages=false",
        "-dGrayImageFilter=/DCTEncode",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=150",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dDetectDuplicateImages=true",
    ],
    "/printer": [
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=300",
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=300",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=300",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
    ],
    "/prepress": [
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
    ],
}

# ---------------------------------------------------------------------------
# In-memory job store  {job_id: {...}}
# ---------------------------------------------------------------------------
_jobs: dict[str, dict] = {}
_jobs_lock = threading.Lock()

JOB_TTL = 600  # seconds — clean up files after 10 minutes


def _prune_old_jobs():
    """Remove jobs older than JOB_TTL from memory and disk."""
    cutoff = time.time() - JOB_TTL
    with _jobs_lock:
        stale = [jid for jid, j in _jobs.items() if j.get("created_at", 0) < cutoff]
        for jid in stale:
            tmp_dir = _jobs[jid].get("tmp_dir")
            if tmp_dir:
                shutil.rmtree(tmp_dir, ignore_errors=True)
            del _jobs[jid]


def _run_ghostscript(job_id: str, input_path: str, output_path: str, level: str, tmp_dir: str):
    """Background thread: run GS, update job status when done."""
    try:
        cmd = (
            [
                "gs",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                f"-dPDFSETTINGS={level}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                "-dSAFER",
            ]
            + LEVEL_PARAMS.get(level, [])
            + [f"-sOutputFile={output_path}", input_path]
        )

        result = subprocess.run(cmd, capture_output=True, timeout=600)

        input_size  = os.path.getsize(input_path)

        if result.returncode != 0:
            err = result.stderr.decode(errors="replace")
            with _jobs_lock:
                _jobs[job_id].update({"status": "error", "error": f"Ghostscript error: {err}"})
            return

        if not os.path.exists(output_path):
            with _jobs_lock:
                _jobs[job_id].update({"status": "error", "error": "Compression produced no output file"})
            return

        output_size = os.path.getsize(output_path)
        serve_path  = output_path if output_size < input_size else input_path

        with _jobs_lock:
            _jobs[job_id].update({
                "status":       "done",
                "serve_path":   serve_path,
                "input_size":   input_size,
                "output_size":  output_size,
            })

    except subprocess.TimeoutExpired:
        with _jobs_lock:
            _jobs[job_id].update({"status": "error", "error": "Processing timed out (600s)"})
    except Exception as e:
        with _jobs_lock:
            _jobs[job_id].update({"status": "error", "error": str(e)})


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

def _run_jpg_to_pdf(job_id: str, image_paths: list[str], output_path: str, level: str, tmp_dir: str):
    """Background thread: combine images → PDF → compress with GS."""
    try:
        # Step 1: combine images into a raw PDF using Pillow
        raw_pdf = os.path.join(tmp_dir, "raw.pdf")
        imgs = []
        for p in image_paths:
            img = Image.open(p).convert("RGB")
            imgs.append(img)

        if not imgs:
            with _jobs_lock:
                _jobs[job_id].update({"status": "error", "error": "No valid images found"})
            return

        imgs[0].save(raw_pdf, save_all=True, append_images=imgs[1:], resolution=150)
        for img in imgs:
            img.close()

        # Step 2: compress the combined PDF with Ghostscript
        cmd = (
            ["gs", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
             f"-dPDFSETTINGS={level}", "-dNOPAUSE", "-dQUIET", "-dBATCH", "-dSAFER"]
            + LEVEL_PARAMS.get(level, [])
            + [f"-sOutputFile={output_path}", raw_pdf]
        )
        result = subprocess.run(cmd, capture_output=True, timeout=600)

        if result.returncode != 0:
            err = result.stderr.decode(errors="replace")
            with _jobs_lock:
                _jobs[job_id].update({"status": "error", "error": f"Ghostscript error: {err}"})
            return

        raw_size  = os.path.getsize(raw_pdf)
        out_size  = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        serve     = output_path if (out_size > 0 and out_size < raw_size) else raw_pdf
        final_size = os.path.getsize(serve)

        with _jobs_lock:
            _jobs[job_id].update({
                "status":      "done",
                "serve_path":  serve,
                "input_size":  raw_size,
                "output_size": final_size,
            })

    except Exception as e:
        with _jobs_lock:
            _jobs[job_id].update({"status": "error", "error": str(e)})


def _run_merge_pdf(job_id: str, pdf_paths: list[str], output_path: str, tmp_dir: str):
    """Background thread: merge PDFs in order using pypdf."""
    try:
        writer = PdfWriter()
        for path in pdf_paths:
            writer.append(path)
        with open(output_path, "wb") as f:
            writer.write(f)
        writer.close()

        total_input = sum(os.path.getsize(p) for p in pdf_paths)
        output_size = os.path.getsize(output_path)

        with _jobs_lock:
            _jobs[job_id].update({
                "status":      "done",
                "serve_path":  output_path,
                "input_size":  total_input,
                "output_size": output_size,
            })
    except Exception as e:
        with _jobs_lock:
            _jobs[job_id].update({"status": "error", "error": str(e)})


# ---------------------------------------------------------------------------
# Split PDF helpers
# ---------------------------------------------------------------------------

def _parse_page_list(spec: str, total_pages: int) -> list[int]:
    """Parse a page spec like "1, 3, 5-8" into a sorted list of 1-based page numbers."""
    pages: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            halves = part.split("-", 1)
            s = int(halves[0].strip()) if halves[0].strip() else 1
            e = int(halves[1].strip()) if halves[1].strip() else total_pages
            pages.update(range(s, e + 1))
        else:
            pages.add(int(part))
    return sorted(p for p in pages if 1 <= p <= total_pages)


def _run_split_pdf(job_id: str, pdf_path: str, mode: str, spec: str, tmp_dir: str):
    """Background thread: split PDF by mode (extract | ranges | all)."""
    try:
        reader     = PdfReader(pdf_path)
        total      = len(reader.pages)
        input_size = os.path.getsize(pdf_path)

        if mode == "extract":
            # Produce a single PDF with the requested pages
            pages  = _parse_page_list(spec, total) if spec.strip() else list(range(1, total + 1))
            writer = PdfWriter()
            for p in pages:
                writer.add_page(reader.pages[p - 1])
            out_path = os.path.join(tmp_dir, "extracted.pdf")
            with open(out_path, "wb") as f:
                writer.write(f)
            writer.close()
            with _jobs_lock:
                _jobs[job_id].update({
                    "status": "done", "serve_path": out_path,
                    "input_size": input_size, "output_size": os.path.getsize(out_path),
                    "output_filename": "extracted.pdf",
                    "output_content_type": "application/pdf",
                })

        elif mode == "ranges":
            # spec = "1-5; 6-10; 11-" — each semicolon-separated chunk → one PDF in ZIP
            parts    = [p.strip() for p in spec.split(";") if p.strip()]
            zip_path = os.path.join(tmp_dir, "split_parts.zip")
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for i, part_spec in enumerate(parts):
                    pages  = _parse_page_list(part_spec, total)
                    writer = PdfWriter()
                    for p in pages:
                        writer.add_page(reader.pages[p - 1])
                    part_path = os.path.join(tmp_dir, f"part_{i + 1:02d}.pdf")
                    with open(part_path, "wb") as fp:
                        writer.write(fp)
                    writer.close()
                    zf.write(part_path, f"part_{i + 1:02d}.pdf")
            with _jobs_lock:
                _jobs[job_id].update({
                    "status": "done", "serve_path": zip_path,
                    "input_size": input_size, "output_size": os.path.getsize(zip_path),
                    "output_filename": "split_parts.zip",
                    "output_content_type": "application/zip",
                })

        elif mode == "all":
            # Every page becomes its own PDF, bundled in a ZIP
            zip_path = os.path.join(tmp_dir, "split_pages.zip")
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for i, page in enumerate(reader.pages):
                    writer    = PdfWriter()
                    writer.add_page(page)
                    page_path = os.path.join(tmp_dir, f"page_{i + 1:04d}.pdf")
                    with open(page_path, "wb") as fp:
                        writer.write(fp)
                    writer.close()
                    zf.write(page_path, f"page_{i + 1:04d}.pdf")
            with _jobs_lock:
                _jobs[job_id].update({
                    "status": "done", "serve_path": zip_path,
                    "input_size": input_size, "output_size": os.path.getsize(zip_path),
                    "output_filename": "split_pages.zip",
                    "output_content_type": "application/zip",
                })

        else:
            with _jobs_lock:
                _jobs[job_id].update({"status": "error", "error": f"Unknown mode: {mode}"})

    except Exception as e:
        with _jobs_lock:
            _jobs[job_id].update({"status": "error", "error": str(e)})


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("ebook"),
):
    """
    Accept the upload, save to a temp dir, kick off GS in a background thread,
    and return a job_id immediately — no waiting for GS to finish.
    """
    _prune_old_jobs()

    if not level.startswith("/"):
        level = f"/{level}"
    if level not in VALID_LEVELS:
        raise HTTPException(status_code=400, detail=f"Invalid compression level: {level}")

    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content   = await file.read()
    job_id    = str(uuid.uuid4())
    tmp_dir   = tempfile.mkdtemp()
    input_path  = os.path.join(tmp_dir, "input.pdf")
    output_path = os.path.join(tmp_dir, "output.pdf")

    with open(input_path, "wb") as f:
        f.write(content)

    with _jobs_lock:
        _jobs[job_id] = {
            "status":     "processing",
            "tmp_dir":    tmp_dir,
            "created_at": time.time(),
        }

    t = threading.Thread(
        target=_run_ghostscript,
        args=(job_id, input_path, output_path, level, tmp_dir),
        daemon=True,
    )
    t.start()

    return JSONResponse({"job_id": job_id})


@app.get("/job/{job_id}")
async def job_status(job_id: str):
    """Poll this endpoint until status is 'done' or 'error'."""
    with _jobs_lock:
        job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] == "done":
        return {
            "status":       "done",
            "input_size":   job["input_size"],
            "output_size":  job["output_size"],
        }
    if job["status"] == "error":
        return {"status": "error", "error": job.get("error", "Unknown error")}

    return {"status": "processing"}


@app.post("/merge-pdf")
async def merge_pdf(files: List[UploadFile] = File(...)):
    """Accept multiple PDFs in order, merge them, return job_id."""
    _prune_old_jobs()

    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 PDF files to merge")

    for f in files:
        fname = (f.filename or "").lower()
        if not fname.endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"Only PDF files accepted: {f.filename}")

    job_id    = str(uuid.uuid4())
    tmp_dir   = tempfile.mkdtemp()
    out_path  = os.path.join(tmp_dir, "merged.pdf")

    pdf_paths: list[str] = []
    for i, upload in enumerate(files):
        path = os.path.join(tmp_dir, f"doc_{i:04d}.pdf")
        content = await upload.read()
        with open(path, "wb") as fp:
            fp.write(content)
        pdf_paths.append(path)

    with _jobs_lock:
        _jobs[job_id] = {
            "status":     "processing",
            "tmp_dir":    tmp_dir,
            "created_at": time.time(),
        }

    threading.Thread(
        target=_run_merge_pdf,
        args=(job_id, pdf_paths, out_path, tmp_dir),
        daemon=True,
    ).start()

    return JSONResponse({"job_id": job_id})


@app.post("/jpg-to-pdf")
async def jpg_to_pdf(
    files: List[UploadFile] = File(...),
    level: str = Form("screen"),
):
    """
    Accept multiple images (in desired order), combine into PDF, compress.
    Returns job_id immediately — same polling pattern as /compress.
    """
    _prune_old_jobs()

    if not level.startswith("/"):
        level = f"/{level}"
    if level not in VALID_LEVELS:
        raise HTTPException(status_code=400, detail=f"Invalid compression level: {level}")

    ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".tif"}
    for f in files:
        ext = os.path.splitext(f.filename or "")[1].lower()
        if ext not in ALLOWED:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {f.filename}")

    job_id   = str(uuid.uuid4())
    tmp_dir  = tempfile.mkdtemp()
    out_path = os.path.join(tmp_dir, "output.pdf")

    # Save all uploaded images preserving order
    image_paths: list[str] = []
    for i, upload in enumerate(files):
        ext  = os.path.splitext(upload.filename or "")[1].lower() or ".jpg"
        path = os.path.join(tmp_dir, f"img_{i:04d}{ext}")
        content = await upload.read()
        with open(path, "wb") as fp:
            fp.write(content)
        image_paths.append(path)

    with _jobs_lock:
        _jobs[job_id] = {
            "status":     "processing",
            "tmp_dir":    tmp_dir,
            "created_at": time.time(),
        }

    threading.Thread(
        target=_run_jpg_to_pdf,
        args=(job_id, image_paths, out_path, level, tmp_dir),
        daemon=True,
    ).start()

    return JSONResponse({"job_id": job_id})


@app.post("/pdf-info")
async def pdf_info(file: UploadFile = File(...)):
    """Return page count without storing anything — fast, synchronous."""
    content = await file.read()
    try:
        reader = PdfReader(io.BytesIO(content))
        return {"page_count": len(reader.pages)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")


@app.post("/split-pdf")
async def split_pdf(
    file: UploadFile = File(...),
    mode: str = Form("extract"),
    spec: str = Form(""),
):
    """
    Split a PDF.
    mode=extract  spec="1, 3, 5-8"          → extracted.pdf
    mode=ranges   spec="1-5; 6-10; 11-15"   → split_parts.zip
    mode=all                                 → split_pages.zip (one page each)
    """
    _prune_old_jobs()

    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    VALID_MODES = {"extract", "ranges", "all"}
    if mode not in VALID_MODES:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")

    content  = await file.read()
    job_id   = str(uuid.uuid4())
    tmp_dir  = tempfile.mkdtemp()
    in_path  = os.path.join(tmp_dir, "input.pdf")

    with open(in_path, "wb") as f:
        f.write(content)

    with _jobs_lock:
        _jobs[job_id] = {
            "status":     "processing",
            "tmp_dir":    tmp_dir,
            "created_at": time.time(),
        }

    threading.Thread(
        target=_run_split_pdf,
        args=(job_id, in_path, mode, spec, tmp_dir),
        daemon=True,
    ).start()

    return JSONResponse({"job_id": job_id})


@app.get("/download/{job_id}")
async def download(job_id: str):
    """Download the result file. Cleans up temp dir after sending."""
    with _jobs_lock:
        job = _jobs.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done":
        raise HTTPException(status_code=409, detail="Job not ready")

    serve_path   = job["serve_path"]
    tmp_dir      = job["tmp_dir"]
    input_size   = job["input_size"]
    output_size  = job["output_size"]
    out_filename = job.get("output_filename", "compressed.pdf")
    out_media    = job.get("output_content_type", "application/pdf")

    def cleanup():
        with _jobs_lock:
            _jobs.pop(job_id, None)
        shutil.rmtree(tmp_dir, ignore_errors=True)

    return FileResponse(
        serve_path,
        media_type=out_media,
        filename=out_filename,
        background=BackgroundTask(cleanup),
        headers={
            "X-Original-Size":               str(input_size),
            "X-Compressed-Size":             str(output_size),
            "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size",
        },
    )
