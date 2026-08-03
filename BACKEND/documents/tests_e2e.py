import time
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from documents.models import Document, DocumentChunk
from ai_engine.orchestrator.ai_pipeline import _process_document
from chat.models import Chat, Message
from quiz.models import Quiz, QuizAttempt


class EndToEndPipelineTestCase(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="e2e_user", password="Password123!")
        self.client.force_authenticate(user=self.user)
        self.pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"

    def test_full_end_to_end_flow(self):
        # 1. Upload PDF
        upload_file = SimpleUploadedFile("sample_study_guide.pdf", self.pdf_bytes, content_type="application/pdf")
        upload_res = self.client.post(
            reverse("document-upload"),
            {"file": upload_file, "title": "Sample Study Guide"},
            format="multipart"
        )
        self.assertEqual(upload_res.status_code, 201)
        doc_id = upload_res.data["id"]

        doc = Document.objects.get(pk=doc_id)
        doc.text_content = (
            "Machine Learning is a branch of artificial intelligence. "
            "Supervised learning algorithms train models on labeled datasets. "
            "Neural networks utilize backpropagation for optimizing model weights."
        )
        doc.save()

        # 2. Run pipeline synchronously for test verification
        _process_document(doc.pk)

        doc.refresh_from_db()
        self.assertEqual(doc.status, Document.STATUS_READY)
        self.assertTrue(bool(doc.summary))
        self.assertTrue(bool(doc.title))
        self.assertGreater(len(doc.keywords), 0)

        # 3. Check Chunks and Embeddings
        chunks = DocumentChunk.objects.filter(document=doc)
        self.assertGreater(chunks.count(), 0)
        self.assertIsNotNone(chunks.first().embedding)

        # 4. Check Default Chat & RAG Q&A
        chat = Chat.objects.filter(document=doc, owner=self.user).first()
        self.assertIsNotNone(chat)

        msg_res = self.client.post(
            reverse("message-create-user", kwargs={"chat_id": chat.pk}),
            {"content": "What is supervised learning?"},
            format="json"
        )
        self.assertEqual(msg_res.status_code, 201)

        messages = Message.objects.filter(chat=chat).order_by("created_at")
        self.assertEqual(messages.count(), 2)
        ai_msg = messages.filter(sender=Message.SENDER_AI).first()
        self.assertIsNotNone(ai_msg)
        self.assertTrue(bool(ai_msg.content and ai_msg.content.strip()))

        # 5. Check Quiz Generation & Submission
        quiz = Quiz.objects.filter(document=doc, owner=self.user).first()
        self.assertIsNotNone(quiz)
        self.assertGreater(quiz.questions.count(), 0)

        # Build answers payload
        answers_map = {}
        for q in quiz.questions.all():
            correct_ans = q.answers.filter(is_correct=True).first()
            if correct_ans:
                answers_map[str(q.pk)] = correct_ans.pk

        submit_res = self.client.post(
            reverse("quiz-submit", kwargs={"pk": quiz.pk}),
            {"answers": answers_map},
            format="json"
        )
        self.assertEqual(submit_res.status_code, 201)
        self.assertIn("score", submit_res.data)
        self.assertGreaterEqual(submit_res.data["score"], 0.0)

        attempt = QuizAttempt.objects.filter(quiz=quiz, user=self.user).first()
        self.assertIsNotNone(attempt)
        self.assertIsNotNone(attempt.score)
