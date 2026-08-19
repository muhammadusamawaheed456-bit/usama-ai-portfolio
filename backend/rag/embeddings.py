import os
from dotenv import load_dotenv
import cohere
import numpy as np

# Load backend/.env
load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")

if not COHERE_API_KEY:
    raise RuntimeError(
        "COHERE_API_KEY is missing. "
        "Make sure it exists in backend/.env"
    )

co = cohere.Client(COHERE_API_KEY)

EMBED_MODEL = os.getenv(
    "COHERE_EMBED_MODEL",
    "embed-english-v3.0",
)


def _normalize(vectors: list[list[float]]) -> list[list[float]]:
    """
    Normalize vectors to unit length.
    """
    arr = np.asarray(vectors, dtype=np.float32)

    norms = np.linalg.norm(arr, axis=1, keepdims=True)

    norms[norms == 0] = 1.0

    return (arr / norms).tolist()


def embed_texts(
    texts: list[str],
) -> list[list[float]]:
    """
    Generate embeddings for multiple knowledge-base documents.
    """

    if not texts:
        return []

    response = co.embed(
        texts=texts,
        model=EMBED_MODEL,
        input_type="search_document",
        embedding_types=["float"],
    )

    vectors = response.embeddings.float

    return _normalize(vectors)


def embed_query(
    query: str,
) -> list[float]:
    """
    Generate an embedding for a user query.
    """

    if not query.strip():
        raise ValueError("Query cannot be empty.")

    response = co.embed(
        texts=[query],
        model=EMBED_MODEL,
        input_type="search_query",
        embedding_types=["float"],
    )

    vector = response.embeddings.float[0]

    normalized = _normalize([vector])

    return normalized[0]