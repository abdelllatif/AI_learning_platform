import io
from pathlib import Path


def _read_pdf_bytes(path: str | Path) -> bytes:
    if isinstance(path, (str, Path)):
        return Path(path).read_bytes()
    raise ValueError("Unsupported PDF path type")


def parse_pdf(path: str) -> str:
    data = _read_pdf_bytes(path)

    try:
        import fitz

        with fitz.open(stream=data, filetype="pdf") as doc:
            pages = [page.get_text("text") for page in doc]
            return "\n\n".join(pages).strip()
    except ImportError:
        try:
            import pdfplumber

            with pdfplumber.open(io.BytesIO(data)) as doc:
                pages = [page.extract_text() or "" for page in doc.pages]
                return "\n\n".join(pages).strip()
        except Exception:
            return ""
    except Exception:
        return ""
