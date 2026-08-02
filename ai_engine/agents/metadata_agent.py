from documents.models import Document
from ai_engine.services.language_detector import detect_language
from ai_engine.services.keyword_extractor import extract_keywords
from ai_engine.services.reading_time import estimate_reading_time


def extract_metadata(document: Document) -> dict:
    text = (document.text_content or "").strip()
    language = document.language or detect_language(text)
    keywords = extract_keywords(text)
    reading_time = estimate_reading_time(text)

    return {
        "language": language,
        "pages": document.pages,
        "keywords": keywords,
        "reading_time": reading_time,
    }
