from documents.models import Document
from ai_engine.agents.validator_agent import validate_pdf
from ai_engine.parser.pdf_parser import parse_pdf


def ingest_document(document: Document) -> None:
    """Validate and parse the document text for the AI pipeline."""
    with document.file.open("rb") as fd:
        validation = validate_pdf(fd, owner=document.owner)

    if not validation["valid"]:
        raise ValueError("Document validation failed: %s" % ", ".join(validation["errors"]))

    document.pages = validation.get("pages")
    document.checksum = validation.get("checksum")
    document.save(update_fields=["pages", "checksum"])

    try:
        text = parse_pdf(document.file.path)
        document.text_content = text
        document.save(update_fields=["text_content"])
    except Exception:
        raise
