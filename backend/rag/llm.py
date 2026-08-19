"""
LLM generation layer.

Supports:
- Groq
- Anthropic
- OpenAI

The provider is selected using LLM_PROVIDER in .env.
"""

import os
from typing import List, Dict, Optional

from dotenv import load_dotenv

# Load backend/.env
load_dotenv(override=True)


SYSTEM_PROMPT = """You are "Usama AI Assistant" — a professional AI agent embedded in
Muhammad Usama Waheed's personal portfolio website. You help recruiters, developers,
and visitors learn about Usama's background, projects, skills, and internship experience.

Rules:
1. Answer ONLY using the CONTEXT provided below, retrieved from Usama's verified
knowledge base (resume, projects, skills, internship, certifications).

2. If the answer isn't in the context, say you don't have that information rather
than guessing or inventing details.

3. Speak about Usama in the third person, in a confident, professional, concise tone
suitable for a recruiter reading quickly.

4. When asked "why hire Usama" or similar, synthesize concrete evidence from the
context (specific projects, skills, outcomes) rather than generic praise.

5. Keep answers focused — a few short paragraphs or a tight bullet list, not an essay.
"""


def _build_user_message(question: str, context: str) -> str:
    return f"""CONTEXT:
{context}

QUESTION:
{question}"""


def generate_answer(
    question: str,
    context: str,
    history: Optional[List[Dict]] = None,
) -> str:

    provider = os.getenv("LLM_PROVIDER", "groq").strip().lower()

    print(f"[LLM] Provider: {provider}")

    if provider == "groq":
        return _generate_groq(
            question,
            context,
            history or [],
        )

    if provider == "openai":
        return _generate_openai(
            question,
            context,
            history or [],
        )

    if provider == "anthropic":
        return _generate_anthropic(
            question,
            context,
            history or [],
        )

    raise ValueError(
        f"Unsupported LLM_PROVIDER: {provider}"
    )


# =========================================================
# GROQ
# =========================================================

def _generate_groq(
    question: str,
    context: str,
    history: List[Dict],
) -> str:

    from openai import OpenAI

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. "
            "Add GROQ_API_KEY to backend/.env"
        )

    model = os.getenv(
        "GROQ_MODEL",
        "openai/gpt-oss-20b",
    )

    print(f"[GROQ] Model: {model}")
    print(f"[GROQ] API key loaded: {bool(api_key)}")

    # Groq provides an OpenAI-compatible API.
    # Increased timeout prevents premature connection/request failures.
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
        timeout=60.0,
        max_retries=2,
    )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    # Add previous conversation history.
    messages.extend(history)

    # Add current question and retrieved context.
    messages.append(
        {
            "role": "user",
            "content": _build_user_message(
                question,
                context,
            ),
        }
    )

    print("[GROQ] Sending request...")

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=600,
        temperature=0.2,
    )

    answer = response.choices[0].message.content

    if not answer:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    print("[GROQ] Response generated successfully")

    return answer


# =========================================================
# ANTHROPIC
# =========================================================

def _generate_anthropic(
    question: str,
    context: str,
    history: List[Dict],
) -> str:

    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is missing."
        )

    model = os.getenv(
        "ANTHROPIC_MODEL",
        "claude-sonnet-5",
    )

    print(f"[ANTHROPIC] Model: {model}")

    client = anthropic.Anthropic(
        api_key=api_key,
        timeout=60.0,
        max_retries=2,
    )

    messages = list(history)

    messages.append(
        {
            "role": "user",
            "content": _build_user_message(
                question,
                context,
            ),
        }
    )

    print("[ANTHROPIC] Sending request...")

    response = client.messages.create(
        model=model,
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    answer = "".join(
        block.text
        for block in response.content
        if block.type == "text"
    )

    if not answer:
        raise RuntimeError(
            "Anthropic returned an empty response."
        )

    print("[ANTHROPIC] Response generated successfully")

    return answer


# =========================================================
# OPENAI
# =========================================================

def _generate_openai(
    question: str,
    context: str,
    history: List[Dict],
) -> str:

    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is missing."
        )

    model = os.getenv(
        "OPENAI_MODEL",
        "gpt-4o-mini",
    )

    print(f"[OPENAI] Model: {model}")

    client = OpenAI(
        api_key=api_key,
        timeout=60.0,
        max_retries=2,
    )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    messages.extend(history)

    messages.append(
        {
            "role": "user",
            "content": _build_user_message(
                question,
                context,
            ),
        }
    )

    print("[OPENAI] Sending request...")

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=600,
        temperature=0.2,
    )

    answer = response.choices[0].message.content

    if not answer:
        raise RuntimeError(
            "OpenAI returned an empty response."
        )

    print("[OPENAI] Response generated successfully")

    return answer