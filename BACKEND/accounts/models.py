from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_verifications")
    token = models.CharField(max_length=64, unique=True, default=uuid.uuid4().hex)
    created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    def mark_verified(self):
        self.verified = True
        self.verified_at = timezone.now()
        self.save()

    def __str__(self):
        return f"EmailVerification(user={self.user.username}, verified={self.verified})"
