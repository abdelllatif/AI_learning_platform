import re
from collections import Counter

STOP_WORDS = {
    "the", "and", "is", "in", "it", "of", "to", "a", "for", "on", "with", "as", "by", "an", "be",
    "this", "that", "are", "or", "from", "at", "was", "which", "have", "has", "had", "not", "but"
}


def extract_keywords(text: str) -> list[str]:
    if not text:
        return []

    words = re.findall(r"\b[\w']{3,}\b", text.lower())
    words = [w for w in words if w not in STOP_WORDS]
    counts = Counter(words)
    most_common = [word for word, _ in counts.most_common(15)]
    return most_common[:10]
