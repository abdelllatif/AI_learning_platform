from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model


class QuizAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="quiz_user", email="quiz@example.com", password="TestPass123")
        self.client.force_authenticate(user=self.user)

    def test_create_quiz_and_submit(self):
        # create quiz with 2 questions, each with 4 answers
        payload = {
            "title": "Sample Quiz",
            "description": "A test quiz",
            "questions": [
                {"text": "Q1?", "order": 0, "answers": [
                    {"text": "A", "is_correct": False},
                    {"text": "B", "is_correct": True},
                    {"text": "C", "is_correct": False},
                    {"text": "D", "is_correct": False}
                ]},
                {"text": "Q2?", "order": 1, "answers": [
                    {"text": "A2", "is_correct": True},
                    {"text": "B2", "is_correct": False},
                    {"text": "C2", "is_correct": False},
                    {"text": "D2", "is_correct": False}
                ]}
            ]
        }
        res = self.client.post(reverse("quiz-list-create"), payload, format="json")
        self.assertEqual(res.status_code, 201)
        quiz_id = res.data.get("id")

        # pick correct answers from returned structure
        detail = self.client.get(reverse("quiz-detail", kwargs={"pk": quiz_id}))
        self.assertEqual(detail.status_code, 200)
        qlist = detail.data.get("questions")
        answers_map = {}
        for q in qlist:
            for a in q.get("answers"):
                if a.get("is_correct"):
                    answers_map[str(q.get("id"))] = a.get("id")
                    break

        submit_res = self.client.post(reverse("quiz-submit", kwargs={"pk": quiz_id}), {"answers": answers_map}, format="json")
        self.assertEqual(submit_res.status_code, 201)
        self.assertIn("score", submit_res.data)
from django.test import TestCase

# Create your tests here.
