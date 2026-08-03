def build_quiz_prompt(text: str, num_questions: int = 5) -> str:
    return (
        "Create a multiple choice quiz from the following document text. "
        "Return a JSON object with fields: title, description, questions. "
        "Each question must include text and an answers array with objects {\"text\", \"is_correct\"}. "
        f"Generate {num_questions} questions.\n\n"
        f"Document text:\n{text}\n"
    )
