import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";
export const openai = new OpenAI({ apiKey });

/**
 * Runs a prompt through ChatGPT using gpt-4o-mini-search-preview via the
 * OpenAI Responses API. The built-in web_search_preview tool grounds the
 * response in real-time web data, so results mirror exactly what a real
 * ChatGPT user with web search enabled would see — critical for accurate
 * GEO tracking.
 */
export async function runOpenAI(promptText: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || !apiKey) {
    return `Mock ChatGPT response for: ${promptText}`;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini-search-preview",
      tools: [{ type: "web_search_preview" }],
      input: promptText,
    });

    // output_text is the SDK convenience getter that concatenates all
    // text blocks from the response output (excluding web_search_call items)
    return response.output_text ?? "";
  } catch (error) {
    console.error("OpenAI execution error:", error);
    throw error;
  }
}
