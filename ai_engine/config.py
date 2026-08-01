import os


class Settings:
    EMBEDDING_MODEL = os.environ.get("AI_EMBEDDING_MODEL", "text-embedding-3-small")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    OPENAI_API_BASE = os.environ.get("OPENAI_API_BASE", "https://api.openai.com")
    VECTOR_DIMENSION = int(os.environ.get("AI_VECTOR_DIMENSION", 1536))
    VECTOR_TABLE = os.environ.get("AI_VECTOR_TABLE", "document_vectors")
    DEFAULT_CHUNK_SIZE = int(os.environ.get("AI_CHUNK_SIZE", 800))
    CHUNK_OVERLAP = int(os.environ.get("AI_CHUNK_OVERLAP", 100))


settings = Settings()
