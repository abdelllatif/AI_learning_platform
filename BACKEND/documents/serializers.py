import os

from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "file",
            "language",
            "pages",
            "checksum",
            "status",
            "uploaded_at",
            "owner",
        ]
        read_only_fields = (
            "owner",
            "uploaded_at",
            "pages",
            "checksum",
            "status",
        )

    def validate_file(self, value):
        if value.size == 0:
            raise serializers.ValidationError("Uploaded file cannot be empty.")

        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("File size must be 10MB or smaller.")

        content_type = getattr(value, "content_type", "")
        if content_type != "application/pdf" and not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed.")
        return value

    def validate(self, attrs):
        return attrs

    def create(self, validated_data):
        if not validated_data.get("title"):
            validated_data["title"] = "Untitled document"
        return super().create(validated_data)
