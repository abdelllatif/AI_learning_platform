def compute_overlap(text: str, overlap_size: int = 100) -> str:
    return text[-overlap_size:] if text and len(text) > overlap_size else text
