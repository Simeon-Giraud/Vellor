export async function generatePrompts(domain: string, brandName: string, industry: string): Promise<string[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return [
      `What are the best tools for ${industry}?`,
      `How to improve ${industry} performance?`,
      `Compare top solutions for ${industry}.`,
      `Why is ${brandName} considered a top choice?`,
      `Best enterprise platforms for ${industry} in 2025.`,
    ]
  }

  // TODO: Implement actual OpenAI logic here later
  return [];
}
