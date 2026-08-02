import os
import cohere
import numpy as np

co = cohere.Client(os.getenv("COHERE_API_KEY"))


def _normalize(vectors: list[list[float]]) -> list[list[float]]:
    arr = np.array(vectors, dtype=np.float32)
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms[norms == 0] = 1  # avoid divide-by-zero
    return (arr / norms).tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed knowledge-base chunks (documents)."""
    response = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
    )
    return _normalize(response.embeddings)


def embed_query(text: str) -> list[float]:
    """Embed a single user query."""
    response = co.embed(
        texts=[text],
        model="embed-english-v3.0",
        input_type="search_query",
    )
    return _normalize(response.embeddings)[0]