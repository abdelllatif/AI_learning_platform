from rest_framework import serializers
from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "chat", "sender", "content", "created_at"]
        read_only_fields = ["id", "created_at", "sender", "chat"]


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "content"]
        read_only_fields = ["id"]


class ChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ["id", "title", "owner", "created_at", "updated_at", "last_message"]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "last_message"]

    def get_last_message(self, obj):
        last = obj.messages.order_by("created_at").last()
        if last:
            return {"sender": last.sender, "content": last.content, "created_at": last.created_at}
        return None


class ChatDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "owner", "created_at", "updated_at", "messages"]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "messages"]
