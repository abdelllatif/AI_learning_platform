from django.db import models
from django.conf import settings


class Chat(models.Model):
    title = models.CharField(max_length=255, default="New Chat")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chats")
    document = models.ForeignKey(
        "documents.Document",
        on_delete=models.CASCADE,
        related_name="chats",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Message(models.Model):
    SENDER_USER = "user"
    SENDER_AI = "ai"
    SENDER_CHOICES = [
        (SENDER_USER, "User"),
        (SENDER_AI, "AI"),
    ]

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender}: {self.content[:40]}"
