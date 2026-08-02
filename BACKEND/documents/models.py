from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):
    STATUS_UPLOADED = "UPLOADED"
    STATUS_PROCESSING = "PROCESSING"
    STATUS_READY = "READY"
    STATUS_FAILED = "FAILED"

    STATUS_CHOICES = [
        (STATUS_UPLOADED, "Uploaded"),
        (STATUS_PROCESSING, "Processing"),
        (STATUS_READY, "Ready"),
        (STATUS_FAILED, "Failed"),
    ]

    title = models.CharField(max_length=255)

    file = models.FileField(upload_to="documents/")

    language = models.CharField(
        max_length=50,
        blank=True
    )

    pages = models.IntegerField(
        null=True,
        blank=True,
    )

    checksum = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        db_index=True,
    )

    text_content = models.TextField(
        blank=True,
        null=True,
    )

    summary = models.TextField(
        blank=True,
        null=True,
    )

    keywords = models.JSONField(
        blank=True,
        null=True,
    )

    reading_time = models.IntegerField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_UPLOADED,
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    def __str__(self):
        return self.title


class DocumentChunk(models.Model):
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="chunks"
    )
    chunk_index = models.IntegerField()
    text = models.TextField()
    metadata = models.JSONField(blank=True, null=True)
    embedding = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("document", "chunk_index")
        ordering = ["chunk_index"]

    def __str__(self):
        return f"DocumentChunk(document_id={self.document_id}, index={self.chunk_index})"