import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = re.sub(r"\n{2,}", "\n\n", cleaned)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"[^\S\n]+\n", "\n", cleaned)
    cleaned = cleaned.strip()
    return cleaned
