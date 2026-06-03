const apiKey = process.env.PERPLEXITY_API_KEY || "";

export async function runPerplexity(promptText: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return `Mock Perplexity response for: ${promptText}`;
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Perplexity execution error:", error);
    throw error;
  }
}
