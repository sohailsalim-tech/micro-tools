from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
import subprocess
import tempfile
import os

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

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_in:
        tmp_in.write(await file.read())
        input_path = tmp_in.name

    output_path = input_path.replace(".pdf", "_compressed.pdf")

    try:
        result = subprocess.run(
            [
                "gs",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                f"-dPDFSETTINGS={level}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                "-dSAFER",
                f"-sOutputFile={output_path}",
                input_path,
            ],
            capture_output=True,
            timeout=120,
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Ghostscript error: {result.stderr.decode(errors='replace')}",
            )

        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Compression produced no output file")

    finally:
        try:
            os.unlink(input_path)
        except OSError:
            pass

    def cleanup():
        try:
            os.unlink(output_path)
        except OSError:
            pass

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="compressed.pdf",
        background=BackgroundTask(cleanup),
    )
