# Known Issues & Outstanding TODOs

## AI Engine Integration
- **`lib/ai/generatePrompts.ts`**: Currently uses mocked AI logic. Needs actual OpenAI/LLM integration to dynamically generate prompts based on the provided keyword.
- **`lib/ai.ts`**: The AI runner engines (`runPromptOnChatGPT`, `runPromptOnGemini`, `runPromptOnPerplexity`) are currently using mocked responses with `setTimeout` to simulate latency. They need to be updated to make real API requests to OpenAI, Google Gemini, and Perplexity respectively.

## Billing & Notifications
- **`app/api/stripe/webhook/route.ts`**: The `customer.subscription.trial_will_end` webhook event is successfully updating the user's `trialEndsAt` date, but a notification system (e.g., triggering an email via Resend or SendGrid) still needs to be implemented to alert the user.
