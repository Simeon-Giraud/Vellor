# Known Issues & Outstanding TODOs

## AI Engine Integration
- **`lib/ai/generatePrompts.ts`**: Currently uses mocked AI logic. Needs actual OpenAI/LLM integration to dynamically generate prompts based on the provided keyword.
- **`lib/ai.ts`**: The AI runner engines (`runPromptOnChatGPT`, `runPromptOnGemini`, `runPromptOnPerplexity`) are currently using mocked responses with `setTimeout` to simulate latency. They need to be updated to make real API requests to OpenAI, Google Gemini, and Perplexity respectively.


