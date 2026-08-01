from django.db import models
from django.conf import settings


class Quiz(models.Model):
    title = models.CharField(max_length=255)
    document = models.ForeignKey(
        "documents.Document",
        on_delete=models.CASCADE,
        related_name="quizzes",
        null=True,
        blank=True,
    )
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quizzes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}"


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="answers")
    text = models.CharField(max_length=1000)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text[:50]}{' (correct)' if self.is_correct else ''}"


class QuizAttempt(models.Model):
	quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quiz_attempts")
	score = models.FloatField(null=True, blank=True)
	started_at = models.DateTimeField(auto_now_add=True)
	finished_at = models.DateTimeField(null=True, blank=True)

	def __str__(self):
		return f"Attempt by {self.user} on {self.quiz} - {self.score}"


class AttemptAnswer(models.Model):
	attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="answers")
	question = models.ForeignKey(Question, on_delete=models.CASCADE)
	selected = models.ForeignKey(Answer, on_delete=models.CASCADE)
	is_correct = models.BooleanField()

	def __str__(self):
		return f"Attempt {self.attempt.id} - Q{self.question.id}: {'OK' if self.is_correct else 'WRONG'}"
