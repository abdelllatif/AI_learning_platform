from documents.models import DocumentChunk


def save_vectors(document_id: int, vectors: list[list[float]]) -> None:
    """Persist chunk embeddings for a document in the database."""
    chunks = DocumentChunk.objects.filter(document_id=document_id).order_by("chunk_index")
    for chunk, embedding in zip(chunks, vectors):
        chunk.embedding = embedding
        chunk.save(update_fields=["embedding"])
