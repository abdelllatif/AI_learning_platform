import io
from pathlib import Path

from ai_engine.ocr.tesseract import run_tesseract


def _read_pdf_bytes(path: str | Path) -> bytes:
    if isinstance(path, (str, Path)):
        return Path(path).read_bytes()
    raise ValueError("Unsupported PDF path type")


def _extract_text_with_fitz(data: bytes) -> str:
    import fitz

    with fitz.open(stream=data, filetype="pdf") as doc:
        pages = [page.get_text("text") or "" for page in doc]
        return "\n\n".join(pages).strip()


def _extract_text_with_pdfplumber(data: bytes) -> str:
    import pdfplumber

    with pdfplumber.open(io.BytesIO(data)) as doc:
        pages = [page.extract_text() or "" for page in doc.pages]
        return "\n\n".join(pages).strip()


def parse_pdf(path: str) -> str:
    data = _read_pdf_bytes(path)
    raw_text = ""

    try:
        raw_text = _extract_text_with_fitz(data)
    except ImportError:
        try:
            raw_text = _extract_text_with_pdfplumber(data)
        except Exception:
            raw_text = ""
    except Exception:
        raw_text = ""

    if not raw_text.strip():
        try:
            raw_text = run_tesseract(path)
        except Exception:
            raw_text = ""

    return raw_text.strip()
