from typing import List, Optional, Tuple

from ai_engine.embeddings.embedding_model import embed_text
from documents.models import Document, DocumentChunk


def _cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0

    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = sum(a * a for a in vec1) ** 0.5
    norm2 = sum(b * b for b in vec2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def retrieve(query: str, document: Optional[Document] = None, top_k: int = 5) -> List[DocumentChunk]:
    query_vector = embed_text(query)
    if not query_vector:
        return []

    if document is not None and not document.is_ready:
        return []

    chunks = DocumentChunk.objects.exclude(embedding__isnull=True)
    if document is not None:
        chunks = chunks.filter(document=document)

    scored: List[Tuple[float, DocumentChunk]] = []

    for chunk in chunks:
        score = _cosine_similarity(query_vector, chunk.embedding or [])
        scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [chunk for _, chunk in scored[:top_k]]
