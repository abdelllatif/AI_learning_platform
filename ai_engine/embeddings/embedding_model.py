from ai_engine.config import settings

_model = None


def _load_model():
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        return None

    return SentenceTransformer(settings.EMBEDDING_MODEL)


def _get_model():
    global _model
    if _model is None:
        _model = _load_model()
    return _model


def embed_text(text: str) -> list[float]:
    model = _get_model()
    if model is None:
        return []
    embeddings = model.encode(text, show_progress_bar=False)
    return embeddings.tolist() if hasattr(embeddings, "tolist") else list(embeddings)
