import os
import traceback
from threading import Thread

from django.db import transaction

from documents.models import Document


def start_document_processing(document):
    """Begin document processing in the background."""
    Thread(target=_process_document_worker, args=(document.pk,), daemon=True).start()


def _process_document_worker(document_id):
    from chat.models import Chat

    try:
        document = Document.objects.get(pk=document_id)
    except Document.DoesNotExist:
        return

    document.status = Document.STATUS_PROCESSING
    document.save(update_fields=["status"])

    try:
        _perform_placeholder_document_processing(document)

        document.status = Document.STATUS_READY
        document.save(update_fields=["status"])

        _create_default_chat(document)
    except Exception:
        document.status = Document.STATUS_FAILED
        document.save(update_fields=["status"])
        # Keep the error trace for debugging; in production hook into logger.
        traceback.print_exc()


def _perform_placeholder_document_processing(document):
    """Placeholder processing steps for V1.

    This implementation prepares the document metadata and creates a default
    chat workspace. Real AI processing can be added later.
    """
    changed = False

    if not document.language:
        document.language = "en"
        changed = True

    if document.title.strip().lower() == "untitled document":
        filename = os.path.basename(document.file.name or "")
        if filename:
            document.title = os.path.splitext(filename)[0]
            changed = True

    if changed:
        document.save(update_fields=[field for field in ["language", "title"] if getattr(document, field)])


def _create_default_chat(document):
    from chat.models import Chat

    title = f"{document.title or 'Document'} Assistant"
    Chat.objects.create(owner=document.owner, document=document, title=title)
