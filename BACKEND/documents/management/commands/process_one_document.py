from django.core.management.base import BaseCommand

from documents.models import Document
from ai_engine.orchestrator.ai_pipeline import _process_document, create_default_chat
from ai_engine.agents.title_agent import generate_title
from ai_engine.agents.metadata_agent import extract_metadata
from ai_engine.agents.summary_agent import generate_summary


class Command(BaseCommand):
    help = "Process one UPLOADED document through the AI pipeline (testing)"

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Skip ingestion and run metadata/title/summary generation')

    def handle(self, *args, **options):
        force = options.get('force')
        doc = Document.objects.filter(status=Document.STATUS_UPLOADED).first()
        if not doc:
            self.stdout.write(self.style.WARNING("No UPLOADED document found"))
            return

        self.stdout.write(f"Processing document {doc.pk} (force={force})...")
        if force:
            # Skip ingestion; run metadata/title/summary generation directly
            title = generate_title(doc)
            metadata = extract_metadata(doc)
            summary = generate_summary(doc)

            if title:
                doc.title = title
            doc.summary = summary
            doc.keywords = metadata.get('keywords') or []
            doc.reading_time = metadata.get('reading_time')
            if metadata.get('language'):
                doc.language = metadata['language']
            doc.status = Document.STATUS_READY
            doc.save(update_fields=['title', 'language', 'summary', 'keywords', 'reading_time', 'status'])

            create_default_chat(doc, summary)
        else:
            _process_document(doc.pk)

        doc.refresh_from_db()
        self.stdout.write(self.style.SUCCESS(
            f"Processed {doc.pk}: title={doc.title!r}, summary_present={bool(doc.summary)}, keywords={doc.keywords}, reading_time={doc.reading_time}"
        ))
