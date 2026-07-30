from django.urls import path
from . import views

urlpatterns = [
    path("", views.ChatListCreateView.as_view(), name="chat-list-create"),
    path("<int:pk>/", views.ChatDetailView.as_view(), name="chat-detail"),
    path("<int:pk>/rename/", views.ChatRenameView.as_view(), name="chat-rename"),
    path("<int:chat_id>/messages/", views.MessageListView.as_view(), name="message-list"),
    path("<int:chat_id>/messages/user/", views.UserMessageCreateView.as_view(), name="message-create-user"),
    path("<int:chat_id>/messages/ai/", views.AIMessageCreateView.as_view(), name="message-create-ai"),
]
