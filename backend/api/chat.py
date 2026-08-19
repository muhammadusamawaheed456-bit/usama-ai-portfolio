from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import traceback

print("[DEBUG] Loading chat.py")

# ---------------------------------------------------------
# RAG imports
# ---------------------------------------------------------

try:
    from rag.retriever import retrieve, build_context_block
    print("[DEBUG] rag.retriever imported successfully")
except Exception as exc:
    print("[ERROR] rag.retriever import failed:", repr(exc))
    traceback.print_exc()
    raise

try:
    from rag.llm import generate_answer
    print("[DEBUG] rag.llm imported successfully")
except Exception as exc:
    print("[ERROR] rag.llm import failed:", repr(exc))
    traceback.print_exc()
    raise


router = APIRouter(prefix="/api", tags=["chat"])


# ---------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )
    history: Optional[List[ChatMessage]] = Field(
        default_factory=list
    )


class SourceRef(BaseModel):
    source: str
    title: str
    score: float


class ChatResponse(BaseModel):
    reply: str
    sources: List[SourceRef]


# ---------------------------------------------------------
# Chat endpoint
# ---------------------------------------------------------

@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    question = payload.message.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    try:
        # Step 1 — Retrieve knowledge
        print(f"[CHAT] Question: {question}")

        chunks = retrieve(
            question,
            top_k=4,
        )

        print(
            f"[CHAT] Retrieved {len(chunks)} knowledge chunks"
        )

        # Step 2 — Build context
        context = build_context_block(chunks)

        print("[CHAT] Context built successfully")

        # Step 3 — Prepare conversation history
        history = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in (payload.history or [])
        ][-6:]

        print(
            f"[CHAT] History messages: {len(history)}"
        )

        # Step 4 — Generate answer
        print("[CHAT] Calling LLM...")

        reply = generate_answer(
            question,
            context,
            history,
        )

        print("[CHAT] LLM response received")

        # Step 5 — Build sources
        sources = [
            SourceRef(
                source=chunk["source"],
                title=chunk["title"],
                score=round(float(chunk["score"]), 3),
            )
            for chunk in chunks
        ]

        print(
            f"[CHAT] Returning {len(sources)} sources"
        )

        return ChatResponse(
            reply=reply,
            sources=sources,
        )

    except Exception as exc:
        print(
            "[CHAT ERROR]",
            repr(exc),
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {exc}",
        ) from exc


# ---------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------

@router.get("/health")
def health():
    return {
        "status": "ok",
    }