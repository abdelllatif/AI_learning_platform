from dataclasses import dataclass


@dataclass
class Citation:
    source: str
    text: str
    page: int | None = None
