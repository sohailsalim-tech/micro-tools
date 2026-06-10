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
    expose_headers=["X-Original-Size", "X-Compressed-Size"],
)

VALID_LEVELS = {"/screen", "/ebook", "/printer", "/prepress"}

# Per-level Ghostscript flags.
# Key additions vs the bare PDFSETTINGS default:
#   - ColorConversionStrategy/sRGB : converts CMYK print PDFs to RGB (removes
#     the 4th ink channel — big win on "4c" / press-ready files)
#   - DownsampleThreshold=1.0      : downsample ANY image above the target DPI,
#     not just those > 1.5× (the lax default)
#   - AutoFilterColorImages=false + DCTEncode : force JPEG re-encoding instead
#     of letting GS decide to keep lossless
LEVEL_PARAMS: dict[str, list[str]] = {
    "/screen": [
        "-dColorConversionStrategy=/sRGB",
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=72",
        "-dColorImageDownsampleThreshold=1.0",
        "-dAutoFilterColorImages=false",
        "-dColorImageFilter=/DCTEncode",
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=72",
        "-dGrayImageDownsampleThreshold=1.0",
        "-dAutoFilterGrayImages=false",
        "-dGrayImageFilter=/DCTEncode",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=72",
        "-dMonoImageDownsampleThreshold=1.0",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dDetectDuplicateImages=true",
    ],
    "/ebook": [
        "-dColorConversionStrategy=/sRGB",
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=150",
        "-dColorImageDownsampleThreshold=1.0",
        "-dAutoFilterColorImages=false",
        "-dColorImageFilter=/DCTEncode",
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=150",
        "-dGrayImageDownsampleThreshold=1.0",
        "-dAutoFilterGrayImages=false",
        "-dGrayImageFilter=/DCTEncode",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=150",
        "-dMonoImageDownsampleThreshold=1.0",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dDetectDuplicateImages=true",
    ],
    "/printer": [
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        "-dColorImageResolution=300",
        "-dColorImageDownsampleThreshold=1.0",
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        "-dGrayImageResolution=300",
        "-dGrayImageDownsampleThreshold=1.0",
        "-dDownsampleMonoImages=true",
        "-dMonoImageResolution=300",
        "-dMonoImageDownsampleThreshold=1.0",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
    ],
    "/prepress": [
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
    ],
}

# Inline PostScript distiller params that set explicit JPEG QFactor per level.
# QFactor: 0.15=max quality  0.9=good  1.5=medium  2.4=max compression
# Passed via  -c "code" -f input.pdf  so they apply before the file is processed.
DISTILLER_PARAMS: dict[str, str] = {
    "/screen": (
        "<< "
        "/ColorACSImageDict << /QFactor 2.4 /Blend 1 /ColorTransform 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        "/GrayACSImageDict  << /QFactor 2.4 /Blend 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        "/ColorImageDict    << /QFactor 2.4 /Blend 1 /ColorTransform 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        "/GrayImageDict     << /QFactor 2.4 /Blend 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        ">> setdistillerparams"
    ),
    "/ebook": (
        "<< "
        "/ColorACSImageDict << /QFactor 1.5 /Blend 1 /ColorTransform 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        "/GrayACSImageDict  << /QFactor 1.5 /Blend 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        "/ColorImageDict    << /QFactor 1.5 /Blend 1 /ColorTransform 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        "/GrayImageDict     << /QFactor 1.5 /Blend 1 "
        "   /HSamples [2 1 1 2] /VSamples [2 1 1 2] >> "
        ">> setdistillerparams"
    ),
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

    content = await file.read()

    tmp_dir = tempfile.mkdtemp()
    input_path  = os.path.join(tmp_dir, "input.pdf")
    output_path = os.path.join(tmp_dir, "output.pdf")

    try:
        with open(input_path, "wb") as f:
            f.write(content)

        base_cmd = [
            "gs",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            f"-dPDFSETTINGS={level}",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            "-dSAFER",
        ] + LEVEL_PARAMS.get(level, []) + [f"-sOutputFile={output_path}"]

        # If this level has distiller params, use -c <params> -f <file>
        # so the quality settings are applied before GS processes the PDF.
        if level in DISTILLER_PARAMS:
            cmd = base_cmd + ["-c", DISTILLER_PARAMS[level], "-f", input_path]
        else:
            cmd = base_cmd + [input_path]

        # 10 min timeout — large files (100 MB+) can take several minutes
        result = subprocess.run(cmd, capture_output=True, timeout=600)

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Ghostscript error: {result.stderr.decode(errors='replace')}",
            )

        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Compression produced no output file")

        input_size  = os.path.getsize(input_path)
        output_size = os.path.getsize(output_path)

        # Never return a file larger than the original
        serve_path = output_path if output_size < input_size else input_path

        def cleanup():
            shutil.rmtree(tmp_dir, ignore_errors=True)

        return FileResponse(
            serve_path,
            media_type="application/pdf",
            filename="compressed.pdf",
            background=BackgroundTask(cleanup),
            headers={
                "X-Original-Size":   str(input_size),
                "X-Compressed-Size": str(output_size),
                "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size",
            },
        )

    except HTTPException:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))
