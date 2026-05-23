# ─────────────────────────────────────────────────────────────────────────────
#  parser.py  —  PDF text extraction for ResumeIQ
# ─────────────────────────────────────────────────────────────────────────────

import re
import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract and clean text from a PDF file.
    Raises ValueError with a user-friendly message on failure.
    """
    try:
        doc = fitz.open(pdf_path)
    except Exception as exc:
        raise ValueError(f"Could not open PDF: {exc}") from exc

    if doc.page_count == 0:
        raise ValueError("The uploaded PDF has no pages.")

    pages: list[str] = []
    for page in doc:
        pages.append(page.get_text("text"))
    doc.close()

    return _clean_text("\n".join(pages))


def _clean_text(text: str) -> str:
    """Normalise common PDF extraction artefacts."""
    ligatures = {
        "\ufb01": "fi",  "\ufb02": "fl",  "\ufb03": "ffi",
        "\ufb04": "ffl", "\u2019": "'",   "\u2018": "'",
        "\u201c": '"',   "\u201d": '"',   "\u2013": "-",
        "\u2014": "-",   "\u00a0": " ",
    }
    for orig, repl in ligatures.items():
        text = text.replace(orig, repl)

    text = re.sub(r"\n{3,}", "\n\n", text)   # collapse blank lines
    text = re.sub(r"[ \t]{2,}", " ", text)   # collapse spaces
    return text.strip()
