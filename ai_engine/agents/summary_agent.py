from documents.models import Document
from ai_engine.llm.openai_client import completion
from ai_engine.prompts.summary_prompt import build_summary_prompt


def _generate_summary_with_model(text: str) -> str:
    prompt = build_summary_prompt(text)
    response = completion(prompt)
    return response.strip() if response else ""


def generate_summary(document: Document) -> str:
    text = (document.text_content or "").strip()
    if not text:
        return ""

    excerpt = text[:4000]
    summary = _generate_summary_with_model(excerpt)
    if summary:
        return summary

    lines = [line.strip() for line in excerpt.splitlines() if line.strip()]
    return " ".join(lines[:3])
