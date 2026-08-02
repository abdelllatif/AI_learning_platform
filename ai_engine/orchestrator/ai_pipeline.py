import traceback
from threading import Thread

from documents.models import Document
from ai_engine.agents.ingestion_agent import ingest_document
from ai_engine.agents.chunk_agent import chunk_document
from ai_engine.agents.title_agent import generate_title
from ai_engine.agents.metadata_agent import extract_metadata
from ai_engine.agents.summary_agent import generate_summary
from ai_engine.agents.quiz_agent import generate_quiz
from ai_engine.agents.chat_agent import create_default_chat


def start_document_processing(document: Document):
    Thread(target=_process_document, args=(document.pk,), daemon=True).start()


def _process_document(document_id: int):
    try:
        document = Document.objects.get(pk=document_id)
    except Document.DoesNotExist:
        return

    document.status = Document.STATUS_PROCESSING
    document.save(update_fields=["status"])

    try:
        ingest_document(document)
        chunk_document(document)
        title = generate_title(document)
        metadata = extract_metadata(document)
        summary = generate_summary(document)
        quiz = generate_quiz(document)

        if title:
            document.title = title
        document.summary = summary
        document.keywords = metadata.get("keywords") or []
        document.reading_time = metadata.get("reading_time")
        if metadata.get("language"):
            document.language = metadata["language"]
        document.save(update_fields=["title", "language", "summary", "keywords", "reading_time"])

        document.status = Document.STATUS_READY
        document.save(update_fields=["status"])

        create_default_chat(document, summary)
    except Exception:
        document.status = Document.STATUS_FAILED
        document.save(update_fields=["status"])
        traceback.print_exc()
