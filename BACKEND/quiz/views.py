from rest_framework import generics, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Quiz, Question, Answer, QuizAttempt, AttemptAnswer
from .serializers import QuizSerializer, QuizDetailSerializer, QuizAttemptSerializer


class QuizListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Quiz.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class QuizDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizDetailSerializer

    def get_queryset(self):
        return Quiz.objects.filter(owner=self.request.user)


class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk, owner=request.user)
        data = request.data.get("answers", {})
        # data expected: {"question_id": selected_answer_id, ...}
        attempt = QuizAttempt.objects.create(quiz=quiz, user=request.user)
        total = 0
        correct = 0
        for q in quiz.questions.all():
            total += 1
            qid = str(q.id)
            sel_id = data.get(qid)
            if sel_id is None:
                # unanswered
                is_corr = False
                selected = None
            else:
                try:
                    selected = Answer.objects.get(pk=sel_id, question=q)
                    is_corr = selected.is_correct
                except Answer.DoesNotExist:
                    selected = None
                    is_corr = False
            if selected:
                AttemptAnswer.objects.create(attempt=attempt, question=q, selected=selected, is_correct=is_corr)
            if is_corr:
                correct += 1
        score = (correct / total) * 100 if total > 0 else 0
        attempt.score = score
        attempt.finished_at = timezone.now()
        attempt.save()
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class QuizHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["quiz__title"]
    ordering_fields = ["started_at", "finished_at", "score"]
    ordering = ["-started_at"]

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).order_by("-started_at")
from django.shortcuts import render

# Create your views here.
