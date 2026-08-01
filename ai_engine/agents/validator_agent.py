from django.core.files.uploadedfile import UploadedFile


def validate_pdf(file: UploadedFile) -> bool:
    return file.content_type == "application/pdf" or str(file.name).lower().endswith(".pdf")
