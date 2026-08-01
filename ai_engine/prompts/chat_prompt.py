def build_chat_prompt(question: str, context: str = "") -> str:
    return f"Answer the question based on the document context:\n\nContext:\n{context}\n\nQuestion:\n{question}\n"
