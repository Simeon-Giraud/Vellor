export async function generatePrompts(keyword: string): Promise<string[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return [
      `What are the best tools for ${keyword}?`,
      `How to improve ${keyword} performance?`,
      `Compare top solutions for ${keyword}.`,
      `Why is ${keyword} important for businesses?`,
      `Best enterprise platforms for ${keyword} in 2025.`,
    ]
  }

  // TODO: Implement actual OpenAI logic here later
  return [];
}
