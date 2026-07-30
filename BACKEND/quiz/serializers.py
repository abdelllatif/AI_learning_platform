from rest_framework import serializers
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
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "owner", "questions", "created_at", "updated_at"]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

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
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "owner", "questions", "created_at", "updated_at"]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class AttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttemptAnswer
        fields = ["id", "question", "selected", "is_correct"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AttemptAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "user", "score", "started_at", "finished_at", "answers"]
        read_only_fields = ["id", "user", "score", "started_at", "finished_at", "answers"]
