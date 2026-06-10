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


@app.get("/download/{job_id}")
async def download(job_id: str):
    """Download the compressed file. Cleans up temp dir after sending."""
    with _jobs_lock:
        job = _jobs.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done":
        raise HTTPException(status_code=409, detail="Job not ready")

    serve_path  = job["serve_path"]
    tmp_dir     = job["tmp_dir"]
    input_size  = job["input_size"]
    output_size = job["output_size"]

    def cleanup():
        with _jobs_lock:
            _jobs.pop(job_id, None)
        shutil.rmtree(tmp_dir, ignore_errors=True)

    return FileResponse(
        serve_path,
        media_type="application/pdf",
        filename="compressed.pdf",
        background=BackgroundTask(cleanup),
        headers={
            "X-Original-Size":               str(input_size),
            "X-Compressed-Size":             str(output_size),
            "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size",
        },
    )
