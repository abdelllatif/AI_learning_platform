import json
import re

from documents.models import Document
from ai_engine.llm.openai_client import completion
from ai_engine.prompts.quiz_prompt import build_quiz_prompt


def _parse_quiz_response(response: str) -> dict:
    if not response:
        return {}

    raw = response.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\})", raw, re.S)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
    return {}


def _validate_quiz_structure(quiz: dict) -> bool:
    if not isinstance(quiz, dict):
        return False
    questions = quiz.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        return False

    valid_q_count = 0
    for q in questions:
        if not isinstance(q, dict):
            continue
        text = q.get("text") or q.get("question")
        answers = q.get("answers") or q.get("options")
        if text and isinstance(answers, list) and len(answers) >= 2:
            valid_q_count += 1

    return valid_q_count > 0


def _generate_fallback_quiz(document: Document, num_questions: int = 5) -> dict:
    text = (document.summary or document.text_content or f"Study content for {document.title}").strip()
    lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 15]
    if not lines:
        lines = ["This document contains key conceptual information for study and review."]

    questions = []
    for idx in range(min(num_questions, max(len(lines), 3))):
        fact = lines[idx % len(lines)]
        q_text = f"According to the document: '{fact[:80]}...', which of the following is true?"
        questions.append({
            "text": q_text,
            "order": idx,
            "answers": [
                {"text": "The statement directly reflects the core concept described in the text.", "is_correct": True},
                {"text": "The statement contradicts the main findings of the document.", "is_correct": False},
                {"text": "The document explicitly disproves this claim.", "is_correct": False},
                {"text": "This information is irrelevant to the topic.", "is_correct": False},
            ]
        })

    return {
        "title": f"Quiz for {document.title or 'Document'}",
        "description": "Auto-generated comprehension quiz.",
        "questions": questions
    }


def _generate_quiz_with_model(text: str, num_questions: int = 5) -> dict:
    prompt = build_quiz_prompt(text, num_questions=num_questions)
    response = completion(prompt)
    if not response:
        return {}
    return _parse_quiz_response(response)


def generate_quiz(document: Document, num_questions: int = 5) -> dict:
    source_text = (document.summary or document.text_content or "").strip()
    if not source_text:
        return _generate_fallback_quiz(document, num_questions=num_questions)

    excerpt = source_text[:4000]

    # Try LLM generation with retry
    for attempt in range(2):
        quiz = _generate_quiz_with_model(excerpt, num_questions=num_questions)
        if _validate_quiz_structure(quiz):
            if not quiz.get("title"):
                quiz["title"] = f"Quiz for {document.title or 'Document'}"
            return quiz

    # Fallback if LLM output fails validation
    return _generate_fallback_quiz(document, num_questions=num_questions)


def save_quiz(document: Document, quiz_data: dict):
    if not quiz_data or not isinstance(quiz_data, dict):
        return None

    from quiz.models import Quiz, Question, Answer

    title = quiz_data.get("title") or f"Quiz for {document.title or 'Document'}"
    description = quiz_data.get("description", "Auto-generated quiz")
    questions = quiz_data.get("questions") or []
    if not isinstance(questions, list) or not questions:
        return None

    quiz = Quiz.objects.create(
        title=title,
        description=description,
        document=document,
        owner=document.owner,
    )

    for idx, question_data in enumerate(questions):
        question_text = question_data.get("text") or question_data.get("question") or f"Question {idx + 1}"
        question = Question.objects.create(
            quiz=quiz,
            text=question_text,
            order=question_data.get("order", idx),
        )
        answers = question_data.get("answers") or question_data.get("options") or []
        has_correct = False
        parsed_answers = []

        for a_idx, answer_data in enumerate(answers):
            if isinstance(answer_data, dict):
                a_text = answer_data.get("text", "")
                is_corr = bool(answer_data.get("is_correct", False))
            else:
                a_text = str(answer_data)
                is_corr = (a_idx == 0)

            if is_corr:
                has_correct = True
            parsed_answers.append((a_text, is_corr))

        # Ensure at least one correct answer
        if not has_correct and parsed_answers:
            parsed_answers[0] = (parsed_answers[0][0], True)

        for a_text, is_corr in parsed_answers:
            Answer.objects.create(
                question=question,
                text=a_text,
                is_correct=is_corr,
            )

    return quiz

