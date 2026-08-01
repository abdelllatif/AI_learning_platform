import hashlib
import io

from django.core.files.uploadedfile import UploadedFile
from documents.models import Document


MAX_PDF_SIZE = 10 * 1024 * 1024


def _read_file_bytes(file):
    file.seek(0)
    data = file.read()
    file.seek(0)
    return data


def _is_pdf_header(data: bytes) -> bool:
    return data[:4] == b"%PDF"


def _checksum(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _get_pdf_metadata(data: bytes) -> dict:
    metadata = {
        "pages": None,
        "is_encrypted": False,
        "is_corrupt": False,
        "errors": [],
    }

    try:
        import fitz

        with fitz.open(stream=data, filetype="pdf") as doc:
            metadata["pages"] = doc.page_count
            metadata["is_encrypted"] = doc.is_encrypted
            if doc.is_encrypted and not doc.authenticate(""):
                metadata["errors"].append("Password protected PDF.")
    except ImportError:
        try:
            import pdfplumber

            with pdfplumber.open(io.BytesIO(data)) as doc:
                metadata["pages"] = len(doc.pages)
        except Exception:
            metadata["is_corrupt"] = True
            metadata["errors"].append("Unable to parse PDF metadata.")
    except Exception:
        metadata["is_corrupt"] = True
        metadata["errors"].append("PDF file is corrupted or unreadable.")

    return metadata


def validate_pdf(file: UploadedFile, owner=None) -> dict:
    errors = []
    data = _read_file_bytes(file)
    size = len(data)

    if size == 0:
        errors.append("Uploaded file is empty.")

    if size > MAX_PDF_SIZE:
        errors.append("PDF file size must be 10MB or smaller.")

    if not _is_pdf_header(data):
        errors.append("File is not a valid PDF.")

    checksum = _checksum(data)
    if owner and Document.objects.filter(checksum=checksum, owner=owner).exists():
        errors.append("This document appears to be a duplicate.")

    metadata = _get_pdf_metadata(data)
    if metadata["is_encrypted"]:
        errors.append("Password-protected PDF files are not supported.")

    if metadata["is_corrupt"]:
        errors.append("PDF file is corrupted or unreadable.")

    return {
        "valid": not errors,
        "errors": errors,
        "size": size,
        "pages": metadata.get("pages"),
        "checksum": checksum,
        "is_encrypted": metadata.get("is_encrypted"),
        "is_corrupt": metadata.get("is_corrupt"),
    }
