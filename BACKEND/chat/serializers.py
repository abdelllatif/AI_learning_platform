from rest_framework import serializers
from documents.models import Document
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
    document = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(),
        required=False,
        allow_null=True,
    )
    document_title = serializers.CharField(source="document.title", read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "title",
            "owner",
            "document",
            "document_title",
            "created_at",
            "updated_at",
            "last_message",
        ]
        read_only_fields = [
            "id",
            "owner",
            "created_at",
            "updated_at",
            "last_message",
            "document_title",
        ]

    def validate_document(self, value):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        if value and value.owner != request.user:
            raise serializers.ValidationError("Document does not belong to you.")
        if value and not value.is_ready:
            raise serializers.ValidationError("Document must be READY to start a chat.")
        return value

    def validate(self, attrs):
        return super().validate(attrs)

    def create(self, validated_data):
        return super().create(validated_data)

    def get_last_message(self, obj):
        last = obj.messages.order_by("created_at").last()
        if last:
            return {"sender": last.sender, "content": last.content, "created_at": last.created_at}
        return None


class ChatDetailSerializer(serializers.ModelSerializer):
    document = serializers.PrimaryKeyRelatedField(read_only=True)
    document_title = serializers.CharField(source="document.title", read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = [
            "id",
            "title",
            "owner",
            "document",
            "document_title",
            "created_at",
            "updated_at",
            "messages",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "messages", "document_title"]
