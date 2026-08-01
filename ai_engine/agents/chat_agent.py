from chat.models import Chat


def create_default_chat(document, summary: str = "") -> Chat:
    title = f"{document.title or 'Document'} Assistant"
    return Chat.objects.create(owner=document.owner, document=document, title=title)


def answer_user_question(chat: Chat, question: str) -> str:
    if not question or not question.strip():
        return "Please provide a question about the document."

    return (
        "This is a placeholder response from the chat agent. "
        "A real RAG retriever will be added in the next stage."
    )
