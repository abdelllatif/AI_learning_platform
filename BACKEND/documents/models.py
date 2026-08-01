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