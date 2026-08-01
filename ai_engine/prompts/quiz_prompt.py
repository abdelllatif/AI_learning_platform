def build_quiz_prompt(text: str) -> str:
    return f"Create 10 multiple choice questions from the following document text:\n\n{text}\n"
