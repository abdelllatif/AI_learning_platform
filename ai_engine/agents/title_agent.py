from documents.models import Document
from ai_engine.llm.openai_client import completion
from ai_engine.prompts.title_prompt import build_title_prompt


def _generate_title_with_model(text: str) -> str:
    prompt = build_title_prompt(text)
    response = completion(prompt)
    return response.strip() if response else ""


def generate_title(document: Document) -> str:
    if document.title and document.title.strip() and document.title.strip().lower() != "untitled document":
        return document.title

    text = (document.text_content or "").strip()
    if not text:
        return "Untitled Document"

    excerpt = text[:3000]
    title = _generate_title_with_model(excerpt)
    return title or document.title or "Untitled Document"
