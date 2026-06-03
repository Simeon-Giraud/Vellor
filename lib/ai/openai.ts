import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey });

export async function runOpenAI(promptText: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return `Mock ChatGPT response for: ${promptText}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptText }],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI execution error:", error);
    throw error;
  }
}
