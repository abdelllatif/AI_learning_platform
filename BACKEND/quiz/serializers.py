from rest_framework import serializers
from documents.models import Document
from .models import Quiz, Question, Answer, QuizAttempt, AttemptAnswer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ["id", "text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "order", "answers"]

    def create(self, validated_data):
        answers_data = validated_data.pop("answers", [])
        question = Question.objects.create(**validated_data)
        for a in answers_data:
            Answer.objects.create(question=question, **a)
        return question


class QuizSerializer(serializers.ModelSerializer):
    document = serializers.PrimaryKeyRelatedField(queryset=Document.objects.all())
    document_title = serializers.CharField(source="document.title", read_only=True)
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "document",
            "document_title",
            "owner",
            "questions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "document_title"]

    def validate_document(self, value):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        if value.owner != request.user:
            raise serializers.ValidationError("Document does not belong to you.")
        if (value.status or "").upper() != "READY":
            raise serializers.ValidationError("Document must be READY to create a quiz.")
        return value

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        owner = validated_data.pop("owner", None) or self.context["request"].user
        quiz = Quiz.objects.create(owner=owner, **validated_data)
        for idx, q in enumerate(questions_data):
            answers = q.pop("answers", [])
            order = q.pop("order", idx)
            question = Question.objects.create(quiz=quiz, order=order, **q)
            for a in answers:
                Answer.objects.create(question=question, **a)
        return quiz


class QuizDetailSerializer(serializers.ModelSerializer):
    document = serializers.PrimaryKeyRelatedField(read_only=True)
    document_title = serializers.CharField(source="document.title", read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "document",
            "document_title",
            "owner",
            "questions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "document_title"]


class AttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttemptAnswer
        fields = ["id", "question", "selected", "is_correct"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    answers = AttemptAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "quiz_title", "user", "score", "started_at", "finished_at", "answers"]
        read_only_fields = ["id", "user", "score", "started_at", "finished_at", "answers", "quiz_title"]
