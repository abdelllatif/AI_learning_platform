from django.urls import path
from .views import (
    DocumentUploadView,
    DocumentListView,
    DocumentDetailView,
    DocumentRenameView,
)

urlpatterns = [
    path("upload/", DocumentUploadView.as_view(), name="document-upload"),
    path("", DocumentListView.as_view(), name="document-list"),
    path("<int:pk>/", DocumentDetailView.as_view(), name="document-detail"),
    path("<int:pk>/rename/", DocumentRenameView.as_view(), name="document-rename"),
]
