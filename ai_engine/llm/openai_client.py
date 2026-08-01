from ai_engine.config import settings
from ai_engine.llm.llm_factory import get_llm_client
from ai_engine.llm.response_parser import parse_response


def completion(prompt: str) -> str:
    client = get_llm_client()
    if client is None:
        return "Local LLM is not available. Install transformers and a compatible model."

    outputs = client(prompt, max_length=settings.LLM_MAX_TOKENS, num_return_sequences=1)
    if not outputs:
        return ""

    text = outputs[0].get("generated_text") if isinstance(outputs, list) else outputs.get("generated_text", "")
    return parse_response(text)
