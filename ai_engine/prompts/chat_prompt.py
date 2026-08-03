def build_chat_prompt(question: str, title: str = "Document", summary: str = "", context: str = "") -> str:
    summary_section = f"Document summary:\n{summary}\n\n" if summary else ""
    return (
        f"Use the document title, summary, and context to answer the question accurately. "
        f"Cite the relevant chunk references (e.g., [Chunk #1]) in your answer when referencing specific information. "
        f"If the answer is not contained in the provided context, state clearly that the document does not contain this information.\n\n"
        f"Document title:\n{title}\n\n"
        f"{summary_section}"
        f"Context:\n{context}\n\n"
        f"Question:\n{question}\n"
    )

