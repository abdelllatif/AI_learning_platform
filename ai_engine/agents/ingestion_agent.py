from documents.models import Document
from ai_engine.agents.validator_agent import validate_pdf
from ai_engine.parser.pdf_parser import parse_pdf
from ai_engine.parser.text_cleaner import clean_text


def ingest_document(document: Document) -> None:
    """Validate, parse, OCR fallback, and clean document text."""
    with document.file.open("rb") as fd:
        validation = validate_pdf(fd, owner=document.owner)

    if not validation["valid"]:
        raise ValueError("Document validation failed: %s" % ", ".join(validation["errors"]))

    document.pages = validation.get("pages")
    document.checksum = validation.get("checksum")
    document.save(update_fields=["pages", "checksum"])

    text = parse_pdf(document.file.path)
    document.text_content = clean_text(text)
    document.save(update_fields=["text_content"])
