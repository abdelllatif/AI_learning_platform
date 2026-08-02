from documents.models import Document, DocumentChunk
from ai_engine.embeddings.embedding_service import create_embeddings


def embed_document_chunks(document: Document) -> None:
    """Generate embeddings for document chunks and save them."""
    chunks = DocumentChunk.objects.filter(document=document).order_by("chunk_index")
    texts = [chunk.text for chunk in chunks]
    if not texts:
        return

    embeddings = create_embeddings(texts)
    if not embeddings:
        return

    for chunk, embedding in zip(chunks, embeddings):
        chunk.embedding = embedding
        chunk.save(update_fields=["embedding"])
