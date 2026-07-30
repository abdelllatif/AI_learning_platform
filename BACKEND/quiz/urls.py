from django.urls import path
from . import views

urlpatterns = [
    path("", views.QuizListCreateView.as_view(), name="quiz-list-create"),
    path("<int:pk>/", views.QuizDetailView.as_view(), name="quiz-detail"),
    path("<int:pk>/submit/", views.QuizSubmitView.as_view(), name="quiz-submit"),
    path("history/", views.QuizHistoryView.as_view(), name="quiz-history"),
]
