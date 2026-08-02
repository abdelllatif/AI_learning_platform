from documents.models import Document, DocumentChunk
from ai_engine.chunking.chunker import chunk_text
from ai_engine.config import settings


def chunk_document(document: Document) -> None:
    """Split document text into chunks and save them to the database."""
    if not document.text_content:
        return

    chunks = chunk_text(
        document.text_content,
        chunk_size=settings.DEFAULT_CHUNK_SIZE,
        overlap=settings.CHUNK_OVERLAP,
    )

    DocumentChunk.objects.filter(document=document).delete()

    for index, chunk in enumerate(chunks):
        DocumentChunk.objects.create(
            document=document,
            chunk_index=index,
            text=chunk,
            metadata={
                "source": "document",
                "document_id": document.pk,
                "chunk_length": len(chunk.split()),
            },
        )
