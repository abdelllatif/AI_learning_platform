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

