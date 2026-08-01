import re


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\r\n", "\n").strip()
    text = re.sub(r"\s+", " ", text)
    return text


def truncate_text(text: str, limit: int = 512) -> str:
    return text if len(text) <= limit else text[: limit - 3].rstrip() + "..."
