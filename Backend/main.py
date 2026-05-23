# ─────────────────────────────────────────────────────────────────────────────
#  main.py  —  ResumeIQ FastAPI application  (v2)
#
#  Endpoints:
#    GET  /           — liveness ping
#    GET  /health     — health check (useful for deployment probes)
#    POST /analyze    — core resume ↔ JD matching
# ─────────────────────────────────────────────────────────────────────────────

import os
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from parser import extract_text_from_pdf
from scorer import calculate_match

app = FastAPI(
    title="ResumeIQ API",
    description="AI-powered resume ↔ job-description analyser",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # lock down to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR   = "uploads"
MAX_PDF_MB   = 5
MAX_JD_CHARS = 10_000

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["meta"])
def root():
    return {"message": "ResumeIQ API is running", "version": "2.0.0"}


@app.get("/health", tags=["meta"])
def health():
    """Simple liveness probe."""
    return {"status": "ok"}


@app.post("/analyze", tags=["core"])
async def analyze_resume(
    resume: UploadFile = File(..., description="Candidate resume — PDF only"),
    job_description: str = Form(..., description="Full job description text"),
):
    """
    Analyse a PDF resume against a job description.

    Returns `match_score`, `semantic_score`, `keyword_score`,
    `strengths`, `missing_skills`, and actionable `suggestions`.
    """
    # ── Validate file type ────────────────────────────────────────────────────
    content_type = resume.content_type or ""
    if "pdf" not in content_type and not (resume.filename or "").lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted. Please upload a .pdf resume.",
        )

    # ── Read & size-check ────────────────────────────────────────────────────
    content = await resume.read()
    if len(content) > MAX_PDF_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"PDF exceeds the {MAX_PDF_MB} MB limit.",
        )

    # ── Validate job description ──────────────────────────────────────────────
    jd = job_description.strip()
    if len(jd) < 30:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short — please paste the full JD.",
        )
    if len(jd) > MAX_JD_CHARS:
        jd = jd[:MAX_JD_CHARS]

    # ── Save to temp file (UUID prevents collisions under concurrent load) ────
    tmp_name = f"{uuid.uuid4().hex}.pdf"
    tmp_path = os.path.join(UPLOAD_DIR, tmp_name)

    with open(tmp_path, "wb") as f:
        f.write(content)

    # ── Extract text ──────────────────────────────────────────────────────────
    try:
        resume_text = extract_text_from_pdf(tmp_path)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)   # clean up immediately

    if len(resume_text.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail=(
                "Not enough text could be extracted from the PDF. "
                "Make sure it is not a scanned/image-only document."
            ),
        )

    # ── Score & return ────────────────────────────────────────────────────────
    result = calculate_match(resume_text, jd)

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return result
