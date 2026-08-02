from chat.models import Chat
from ai_engine.retriever.retriever import retrieve
from ai_engine.llm.openai_client import completion
from ai_engine.prompts.chat_prompt import build_chat_prompt


def create_default_chat(document, summary: str = "") -> Chat:
    title = f"{document.title or 'Document'} Assistant"
    return Chat.objects.create(owner=document.owner, document=document, title=title)


def answer_user_question(chat: Chat, question: str) -> str:
    if not question or not question.strip():
        return "Please provide a question about the document."

    if not chat.document:
        return "This chat is not attached to a document. Please create a chat linked to a READY document."

    chunks = retrieve(question, document=chat.document, top_k=3)
    if not chunks:
        return "No indexed document content is available yet. Please wait until the document processing completes."

    context = "\n\n".join(chunk.text for chunk in chunks)
    prompt = build_chat_prompt(
        question,
        title=chat.document.title or "Document",
        summary=chat.document.summary or "",
        context=context,
    )
    response = completion(prompt)
    if not response:
        return "I could not generate an answer. Please try again later."
    return response
