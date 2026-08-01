from dataclasses import dataclass
from typing import List


@dataclass
class DocumentContext:
    document_id: int
    title: str
    language: str
    summary: str
    keywords: List[str]
    citations: List[str]
