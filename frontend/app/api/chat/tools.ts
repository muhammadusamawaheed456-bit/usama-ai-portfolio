const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";

export async function searchKnowledgeExecute(query: string) {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: query,
        history: [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Backend Error:",
        response.status,
        errorText
      );

      throw new Error(`Backend failed: ${response.status}`);
    }

    const data = await response.json();

    console.log("Backend Response:", data);

    return {
      reply: data.reply,
      sources: data.sources ?? [],
    };
  } catch (error) {
    console.error(
      "Knowledge Search Error:",
      error
    );

    throw error;
  }
}