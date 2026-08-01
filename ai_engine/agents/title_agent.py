from documents.models import Document


def generate_title(document: Document) -> str:
    return document.title or "Untitled Document"
