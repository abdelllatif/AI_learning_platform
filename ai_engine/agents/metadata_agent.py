from documents.models import Document


def extract_metadata(document: Document) -> dict:
    return {
        "language": document.language or "en",
        "pages": None,
        "keywords": [],
    }
