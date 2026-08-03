import io
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from documents.models import Document
from ai_engine.agents.validator_agent import validate_pdf


class ValidatorAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="val_user", password="Password123!")
        # Valid minimal PDF file header bytes
        self.valid_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"

    def test_validate_empty_file(self):
        empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
        res = validate_pdf(empty_file, owner=self.user)
        self.assertFalse(res["valid"])
        self.assertIn("Uploaded file is empty.", res["errors"])

    def test_validate_non_pdf_file(self):
        txt_file = SimpleUploadedFile("hello.txt", b"Hello World", content_type="text/plain")
        res = validate_pdf(txt_file, owner=self.user)
        self.assertFalse(res["valid"])
        self.assertIn("File is not a valid PDF.", res["errors"])

    def test_validate_valid_pdf_header(self):
        pdf_file = SimpleUploadedFile("valid.pdf", self.valid_pdf_bytes, content_type="application/pdf")
        res = validate_pdf(pdf_file, owner=self.user)
        self.assertTrue(res["valid"])
        self.assertIsNotNone(res["checksum"])
        self.assertEqual(len(res["checksum"]), 64)

    def test_validate_duplicate_pdf(self):
        pdf_file = SimpleUploadedFile("doc.pdf", self.valid_pdf_bytes, content_type="application/pdf")
        val1 = validate_pdf(pdf_file, owner=self.user)
        self.assertTrue(val1["valid"])

        # Save document with this checksum
        Document.objects.create(
            owner=self.user,
            title="Doc 1",
            checksum=val1["checksum"]
        )

        # Validate duplicate
        val2 = validate_pdf(pdf_file, owner=self.user)
        self.assertFalse(val2["valid"])
        self.assertIn("This document appears to be a duplicate.", val2["errors"])


class PdfParserAndCleanerTestCase(TestCase):
    def test_clean_text_normalizes_line_endings_and_spaces(self):
        from ai_engine.parser.text_cleaner import clean_text

        raw = "Hello\r\n\r\nWorld!\n\n\n\nThis   is   a   test.\t\tEnd.  \n "
        cleaned = clean_text(raw)
        self.assertEqual(cleaned, "Hello\n\nWorld!\n\nThis is a test. End.")

    def test_clean_text_empty(self):
        from ai_engine.parser.text_cleaner import clean_text

        self.assertEqual(clean_text(""), "")
        self.assertEqual(clean_text(None), "")

    def test_parse_pdf_fallback(self):
        from ai_engine.parser.pdf_parser import parse_pdf
        import tempfile, os

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(b"%PDF-1.4\n%EOF")
            tmp_path = tmp.name

        try:
            text = parse_pdf(tmp_path)
            self.assertIsInstance(text, str)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


class MetadataAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="meta_user", password="Password123!")

    def test_language_detector(self):
        from ai_engine.services.language_detector import detect_language

        self.assertEqual(detect_language(""), "en")
        self.assertIn(detect_language("Bonjour tout le monde. C'est un test en français."), ["fr", "en"])

    def test_keyword_extractor(self):
        from ai_engine.services.keyword_extractor import extract_keywords

        text = "Artificial intelligence and machine learning are revolutionizing technology. Machine learning is great."
        keywords = extract_keywords(text)
        self.assertIsInstance(keywords, list)
        self.assertIn("learning", keywords)
        self.assertIn("machine", keywords)

    def test_metadata_agent_extraction(self):
        from ai_engine.agents.metadata_agent import extract_metadata

        doc = Document.objects.create(
            owner=self.user,
            title="Metadata Doc",
            text_content="Python is an interpreted high-level general-purpose programming language. Python design philosophy emphasizes code readability.",
            pages=5
        )

        metadata = extract_metadata(doc)
        self.assertEqual(metadata["pages"], 5)
        self.assertIsInstance(metadata["keywords"], list)
        self.assertIn("python", metadata["keywords"])
        self.assertIsNotNone(metadata["reading_time"])


class TitleAndSummaryAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="ts_user", password="Password123!")

    def test_generate_title_existing(self):
        from ai_engine.agents.title_agent import generate_title

        doc = Document.objects.create(owner=self.user, title="Existing Custom Title", text_content="Some content")
        title = generate_title(doc)
        self.assertEqual(title, "Existing Custom Title")

    def test_generate_title_fallback(self):
        from ai_engine.agents.title_agent import generate_title

        doc = Document.objects.create(
            owner=self.user,
            title="Untitled Document",
            text_content="Deep Learning and Neural Networks guide for beginners."
        )
        title = generate_title(doc)
        self.assertTrue(bool(title and title.strip()))

    def test_generate_summary_fallback(self):
        from ai_engine.agents.summary_agent import generate_summary

        doc = Document.objects.create(
            owner=self.user,
            title="Test Doc",
            text_content="Line one of document.\nLine two of document.\nLine three of document."
        )
        summary = generate_summary(doc)
        self.assertTrue(bool(summary and summary.strip()))


class ChunkAndEmbeddingAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="ce_user", password="Password123!")

    def test_chunk_and_embed_document(self):
        from ai_engine.agents.chunk_agent import chunk_document
        from ai_engine.agents.embedding_agent import embed_document_chunks
        from documents.models import DocumentChunk

        long_text = "Word " * 1000
        doc = Document.objects.create(
            owner=self.user,
            title="Long Chunk Document",
            text_content=long_text
        )

        chunk_document(doc)
        chunks = DocumentChunk.objects.filter(document=doc).order_by("chunk_index")
        self.assertGreater(chunks.count(), 1)
        self.assertEqual(chunks[0].chunk_index, 0)
        self.assertEqual(chunks[1].chunk_index, 1)

        embed_document_chunks(doc)
        first_chunk = DocumentChunk.objects.get(pk=chunks[0].pk)
        self.assertIsNotNone(first_chunk.embedding)
        self.assertGreater(len(first_chunk.embedding), 0)


class RetrieverAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="ret_user", password="Password123!")

    def test_retriever_ranking(self):
        from ai_engine.retriever.retriever import retrieve
        from ai_engine.embeddings.embedding_service import create_embeddings
        from documents.models import DocumentChunk

        doc = Document.objects.create(
            owner=self.user,
            title="Quantum vs Cooking",
            status=Document.STATUS_READY,
            text_content="Quantum mechanics physics. Delicious pasta recipe cooking."
        )

        c1_text = "Quantum computing uses qubits and superposition principle in physics."
        c2_text = "Bake pasta with tomato sauce, mozzarella cheese, and garlic at 200 degrees."

        embs = create_embeddings([c1_text, c2_text])

        chunk1 = DocumentChunk.objects.create(document=doc, chunk_index=0, text=c1_text, embedding=embs[0])
        chunk2 = DocumentChunk.objects.create(document=doc, chunk_index=1, text=c2_text, embedding=embs[1])

        results = retrieve("qubits and physics", document=doc, top_k=2)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0].pk, chunk1.pk)


class ChatAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="chat_user", password="Password123!")

    def test_chat_agent_flow(self):
        from ai_engine.agents.chat_agent import create_default_chat, answer_user_question
        from ai_engine.embeddings.embedding_service import create_embeddings
        from documents.models import DocumentChunk
        from chat.models import Chat

        doc = Document.objects.create(
            owner=self.user,
            title="AI Intro",
            status=Document.STATUS_READY,
            text_content="Artificial Intelligence overview."
        )

        chat = create_default_chat(doc, summary="AI Summary")
        self.assertIsInstance(chat, Chat)
        self.assertEqual(chat.document, doc)

        text = "Artificial intelligence uses neural networks for pattern recognition."
        emb = create_embeddings([text])[0]
        DocumentChunk.objects.create(document=doc, chunk_index=0, text=text, embedding=emb)

        ans = answer_user_question(chat, "What is AI?")
        self.assertTrue(bool(ans and ans.strip()))


class QuizAgentTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="quiz_ag_user", password="Password123!")

    def test_quiz_validation(self):
        from ai_engine.agents.quiz_agent import _validate_quiz_structure

        invalid_quiz = {"title": "Bad Quiz", "questions": "not a list"}
        self.assertFalse(_validate_quiz_structure(invalid_quiz))

        valid_quiz = {
            "title": "Good Quiz",
            "questions": [
                {
                    "text": "What is Python?",
                    "answers": [
                        {"text": "Language", "is_correct": True},
                        {"text": "Snake", "is_correct": False}
                    ]
                }
            ]
        }
        self.assertTrue(_validate_quiz_structure(valid_quiz))

    def test_quiz_fallback_generation_and_saving(self):
        from ai_engine.agents.quiz_agent import generate_quiz, save_quiz
        from quiz.models import Quiz, Question, Answer

        doc = Document.objects.create(
            owner=self.user,
            title="Python Basics",
            status=Document.STATUS_READY,
            text_content="Python is an interpreted programming language used widely in data science and AI."
        )

        quiz_data = generate_quiz(doc, num_questions=3)
        self.assertIn("questions", quiz_data)
        self.assertGreater(len(quiz_data["questions"]), 0)

        saved_quiz = save_quiz(doc, quiz_data)
        self.assertIsNotNone(saved_quiz)
        self.assertEqual(saved_quiz.document, doc)

        questions = Question.objects.filter(quiz=saved_quiz)
        self.assertGreater(questions.count(), 0)

        answers = Answer.objects.filter(question=questions.first())
        self.assertGreater(answers.count(), 0)
        self.assertTrue(answers.filter(is_correct=True).exists())







