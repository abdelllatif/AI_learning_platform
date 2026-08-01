from rest_framework import generics, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Chat, Message
from .serializers import (
    ChatSerializer,
    ChatDetailSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)


class ChatListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["updated_at", "created_at", "title"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return Chat.objects.filter(owner=self.request.user).order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ChatDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatDetailSerializer

    def get_queryset(self):
        return Chat.objects.filter(owner=self.request.user)


class ChatRenameView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return Chat.objects.filter(owner=self.request.user)


class MessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = None
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["content"]
    ordering_fields = ["created_at"]
    ordering = ["created_at"]

    def get_queryset(self):
        chat = get_object_or_404(Chat, pk=self.kwargs["chat_id"], owner=self.request.user)
        return chat.messages.all()


class UserMessageCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageCreateSerializer

    def perform_create(self, serializer):
        chat = get_object_or_404(Chat, pk=self.kwargs["chat_id"], owner=self.request.user)
        # create user message
        user_msg = Message.objects.create(chat=chat, sender=Message.SENDER_USER, content=serializer.validated_data["content"])
        # create static AI response
        ai_content = "hello im ure agent i will help u today any way its just a response static so u know and i guess what wan we do"
        Message.objects.create(chat=chat, sender=Message.SENDER_AI, content=ai_content)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"detail": "user message saved and ai reply created"}, status=status.HTTP_201_CREATED)


class AIMessageCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageCreateSerializer

    def perform_create(self, serializer):
        chat = get_object_or_404(Chat, pk=self.kwargs["chat_id"], owner=self.request.user)
        Message.objects.create(chat=chat, sender=Message.SENDER_AI, content=serializer.validated_data["content"])

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"detail": "ai message saved"}, status=status.HTTP_201_CREATED)
from django.shortcuts import render

# Create your views here.
