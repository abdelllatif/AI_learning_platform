def build_chat_prompt(question: str, title: str = "Document", summary: str = "", context: str = "") -> str:
    summary_section = f"Document summary:\n{summary}\n\n" if summary else ""
    return (
        f"Use the document title, summary, and context to answer the question. "
        f"If the answer is not contained in the provided context, say you do not know.\n\n"
        f"Document title:\n{title}\n\n"
        f"{summary_section}"
        f"Context:\n{context}\n\n"
        f"Question:\n{question}\n"
    )
