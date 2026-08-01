from ai_engine.config import settings

_client = None


def _load_llm():
    try:
        from transformers import pipeline
        import torch
    except ImportError:
        return None

    device = -1
    if settings.LLM_DEVICE.lower() in ("cuda", "gpu") and torch.cuda.is_available():
        device = 0

    try:
        return pipeline(
            "text-generation",
            model=settings.LLM_MODEL,
            device=device,
            max_length=settings.LLM_MAX_TOKENS,
            pad_token_id=50256,
        )
    except Exception:
        return None


def get_llm_client():
    global _client
    if _client is None:
        _client = _load_llm()
    return _client
