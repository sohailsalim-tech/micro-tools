from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
import subprocess
import tempfile
import os
import shutil

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
)

VALID_LEVELS = {"/screen", "/ebook", "/printer", "/prepress"}

# Explicit per-level Ghostscript parameters.
# These override the defaults that PDFSETTINGS alone sets, forcing real
# image downsampling and DCT (JPEG) re-encoding at the target resolution.
LEVEL_PARAMS: dict[str, list[str]] = {
    "/screen": [
        # Colour images → 72 dpi, JPEG re-encode (forces actual size reduction)
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=72",
        "-dAutoFilterColorImages=false",
        "-dColorImageFilter=/DCTEncode",
        # Grey images → 72 dpi
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=72",
        "-dAutoFilterGrayImages=false",
        "-dGrayImageFilter=/DCTEncode",
        # Mono images → 72 dpi
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=72",
        # Font & structure
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dDetectDuplicateImages=true",
        "-dFastWebView=false",
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


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("ebook"),
):
    if not level.startswith("/"):
        level = f"/{level}"

    if level not in VALID_LEVELS:
        raise HTTPException(status_code=400, detail=f"Invalid compression level: {level}")

    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Use a temp directory so both input + output live together and
    # cleanup is a single shutil.rmtree call.
    tmp_dir = tempfile.mkdtemp()
    input_path  = os.path.join(tmp_dir, "input.pdf")
    output_path = os.path.join(tmp_dir, "output.pdf")

    try:
        with open(input_path, "wb") as f:
            f.write(await file.read())

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

        result = subprocess.run(cmd, capture_output=True, timeout=120)

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Ghostscript error: {result.stderr.decode(errors='replace')}",
            )

        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Compression produced no output file")

        input_size  = os.path.getsize(input_path)
        output_size = os.path.getsize(output_path)

        # If Ghostscript made the file larger (e.g. already-optimised input),
        # serve the original — never return something bigger than what was uploaded.
        serve_path = output_path if output_size < input_size else input_path

        def cleanup():
            shutil.rmtree(tmp_dir, ignore_errors=True)

        # X-Original-Size / X-Compressed-Size let the frontend calculate the
        # real reduction even when we fall back to the original file.
        return FileResponse(
            serve_path,
            media_type="application/pdf",
            filename="compressed.pdf",
            background=BackgroundTask(cleanup),
            headers={
                "X-Original-Size":   str(input_size),
                "X-Compressed-Size": str(output_size),
            },
        )

    except HTTPException:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))
