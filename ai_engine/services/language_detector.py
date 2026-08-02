def detect_language(text: str) -> str:
    if not text:
        return "en"

    try:
        from langdetect import detect

        return detect(text)
    except Exception:
        return "en"
