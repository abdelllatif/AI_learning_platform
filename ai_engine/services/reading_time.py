def estimate_reading_time(text: str, wpm: int = 200) -> int:
    if not text:
        return 0
    words = len(text.split())
    return max(1, words // wpm)
