from django.contrib import admin
from .models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
	list_display = ("id", "title", "owner", "created_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
	list_display = ("id", "chat", "sender", "created_at")
	list_filter = ("sender",)
