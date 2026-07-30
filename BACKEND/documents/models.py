from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):

    title = models.CharField(max_length=255)

    file = models.FileField(upload_to="documents/")

    language = models.CharField(
        max_length=50,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        default="UPLOADED"
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