from django.contrib import admin
from .models import Quiz, Question, Answer, QuizAttempt, AttemptAnswer


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
	list_display = ("id", "title", "owner", "created_at")


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
	list_display = ("id", "quiz", "order", "text")


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
	list_display = ("id", "question", "text", "is_correct")


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
	list_display = ("id", "quiz", "user", "score", "started_at", "finished_at")


@admin.register(AttemptAnswer)
class AttemptAnswerAdmin(admin.ModelAdmin):
	list_display = ("id", "attempt", "question", "selected", "is_correct")
