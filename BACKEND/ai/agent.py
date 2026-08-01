from chat.models import Chat


def answer_user_message(chat: Chat, user_message: str) -> str:
    """Generate a simple AI response for a user message.

    This placeholder agent can be replaced by a real RAG engine later.
    """
    if not user_message or not user_message.strip():
        return "Please ask a question so I can help."

    # Basic fallback RAG-like behavior for V1.
    if "document" in (chat.document.title or "").lower() or "pdf" in user_message.lower():
        return (
            "I found information in your document. "
            "For now, I am using a simple agent placeholder. "
            "Use the document-specific chat to ask more details."
        )

    return (
        "I could not locate a direct answer in this document yet. "
        "Please try a more specific question or check the uploaded file."
    )
