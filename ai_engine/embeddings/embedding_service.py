from .embedding_model import embed_text


def create_embeddings(texts: list[str]) -> list[list[float]]:
    return [embed_text(text) for text in texts]
