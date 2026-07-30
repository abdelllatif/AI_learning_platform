from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document
from .serializers import DocumentSerializer


class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = DocumentSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        documents = Document.objects.filter(owner=request.user).order_by("-uploaded_at")
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(Document, pk=pk, owner=user)

    def get(self, request, pk):
        document = self.get_object(pk, request.user)
        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    def delete(self, request, pk):
        document = self.get_object(pk, request.user)
        if document.file:
            document.file.delete(save=False)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentRenameView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        document = get_object_or_404(Document, pk=pk, owner=request.user)
        title = request.data.get("title", "").strip()
        if not title:
            return Response(
                {"title": "New title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Document.objects.filter(owner=request.user, title=title).exclude(pk=document.pk).exists():
            return Response(
                {"title": "You already have a document with this title."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        document.title = title
        document.save()
        serializer = DocumentSerializer(document)
        return Response(serializer.data)
