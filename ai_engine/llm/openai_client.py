from ai_engine.config import settings
from ai_engine.llm.llm_factory import get_llm_client
from ai_engine.llm.response_parser import parse_response


def _truncate_prompt(prompt: str, client) -> str:
    tokenizer = getattr(client, "tokenizer", None)
    if tokenizer is None:
        return prompt

    max_length = getattr(tokenizer, "model_max_length", None)
    if max_length is None or max_length <= 0:
        return prompt

    max_context = max_length - settings.LLM_MAX_TOKENS
    if max_context <= 0:
        return prompt

    encoded = tokenizer(prompt, return_tensors="pt", add_special_tokens=False)
    input_ids = encoded["input_ids"][0]
    if len(input_ids) <= max_context:
        return prompt

    truncated_ids = input_ids[-max_context:]
    return tokenizer.decode(truncated_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)


def completion(prompt: str) -> str:
    client = get_llm_client()
    if client is None:
        return "Local LLM is not available. Install transformers and a compatible model."

    prompt = _truncate_prompt(prompt, client)
    outputs = client(
        prompt,
        max_length=getattr(client.tokenizer, "model_max_length", settings.LLM_MAX_TOKENS + 50),
        max_new_tokens=settings.LLM_MAX_TOKENS,
        num_return_sequences=1,
        do_sample=False,
        truncation=True,
    )
    if not outputs:
        return ""

    text = outputs[0].get("generated_text") if isinstance(outputs, list) else outputs.get("generated_text", "")
    return parse_response(text)
