import os


class Settings:
    EMBEDDING_MODEL = os.environ.get("AI_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    LLM_PROVIDER = os.environ.get("AI_LLM_PROVIDER", "ollama")
    OLLAMA_URL = os.environ.get("AI_OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.environ.get("AI_OLLAMA_MODEL", "qwen2.5")
    LLM_MODEL = os.environ.get("AI_LLM_MODEL", "gpt2")
    LLM_MAX_TOKENS = int(os.environ.get("AI_LLM_MAX_TOKENS", 512))
    VECTOR_DIMENSION = int(os.environ.get("AI_VECTOR_DIMENSION", 384))
    VECTOR_TABLE = os.environ.get("AI_VECTOR_TABLE", "document_vectors")
    DEFAULT_CHUNK_SIZE = int(os.environ.get("AI_CHUNK_SIZE", 800))
    CHUNK_OVERLAP = int(os.environ.get("AI_CHUNK_OVERLAP", 100))
    LLM_DEVICE = os.environ.get("AI_LLM_DEVICE", "cpu")


settings = Settings()
