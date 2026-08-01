from documents.models import Document


def generate_quiz(document: Document) -> dict:
    return {
        "title": f"Quiz for {document.title}",
        "questions": [],
    }
