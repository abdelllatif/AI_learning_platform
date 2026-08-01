from dataclasses import dataclass


@dataclass
class Chunk:
    id: str
    text: str
    metadata: dict
