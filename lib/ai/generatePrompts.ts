/**
 * generatePrompts — AI-powered search query generator
 *
 * Generates realistic queries that potential customers type into ChatGPT,
 * Gemini, and Perplexity when looking for solutions in a given industry.
 * The count is derived from the user's plan (maxPromptsPerProject).
 *
 * Strategy:
 *  1. If NEXT_PUBLIC_USE_MOCK_AI=true → fast deterministic set (dev/test).
 *  2. If GEMINI_API_KEY is set → use Gemini to generate contextual prompts.
 *  3. Fallback → high-quality template engine that always returns `count` items.
 */

// ─── Template bank: diverse query archetypes ─────────────────────────────────
const QUERY_TEMPLATES = [
  // Discovery / recommendation
  (b: string, i: string) => `What is the best ${i} tool for startups?`,
  (b: string, i: string) => `Top ${i} platforms recommended by experts`,
  (b: string, i: string) => `Best ${i} software in 2025`,
  (b: string, i: string) => `What ${i} tools do fast-growing companies use?`,
  (b: string, i: string) => `Which ${i} solution is easiest to set up?`,
  (b: string, i: string) => `Most popular ${i} tools for small businesses`,
  (b: string, i: string) => `${i} tools that integrate with Slack and Notion`,
  (b: string, i: string) => `Affordable ${i} solutions for bootstrapped teams`,
  (b: string, i: string) => `What ${i} platform do agencies prefer?`,
  (b: string, i: string) => `Best ${i} tools for remote teams`,

  // Comparison
  (b: string, i: string) => `Compare the top ${i} solutions`,
  (b: string, i: string) => `${i} tools comparison: pros and cons`,
  (b: string, i: string) => `What are the alternatives to ${b}?`,
  (b: string, i: string) => `${b} vs competitors — which is better?`,
  (b: string, i: string) => `How does ${b} compare to other ${i} tools?`,

  // Brand-specific
  (b: string, i: string) => `Is ${b} worth it for ${i}?`,
  (b: string, i: string) => `What do users say about ${b}?`,
  (b: string, i: string) => `${b} reviews and ratings`,
  (b: string, i: string) => `Who uses ${b} and why?`,
  (b: string, i: string) => `${b} pricing — is it competitive?`,
  (b: string, i: string) => `${b} features overview`,
  (b: string, i: string) => `Is ${b} a reliable ${i} solution?`,
  (b: string, i: string) => `How do I get started with ${b}?`,
  (b: string, i: string) => `What problems does ${b} solve?`,
  (b: string, i: string) => `Does ${b} have an API or integrations?`,

  // Use-case / outcome
  (b: string, i: string) => `How to improve ${i} performance in 2025?`,
  (b: string, i: string) => `How can AI help with ${i}?`,
  (b: string, i: string) => `What is the ROI of investing in ${i} tools?`,
  (b: string, i: string) => `How to choose a ${i} platform for my business?`,
  (b: string, i: string) => `Common mistakes when picking a ${i} solution`,
  (b: string, i: string) => `How to scale ${i} operations efficiently?`,
  (b: string, i: string) => `Best practices for ${i} in growing companies`,
  (b: string, i: string) => `What features should a good ${i} tool have?`,
  (b: string, i: string) => `${i} tools trusted by enterprise teams`,
  (b: string, i: string) => `How to evaluate ${i} software vendors?`,

  // Intent signals
  (b: string, i: string) => `Should I build or buy a ${i} solution?`,
  (b: string, i: string) => `Free vs paid ${i} tools — what's the difference?`,
  (b: string, i: string) => `Top ${i} tools with free trials`,
  (b: string, i: string) => `What are the hidden costs of ${i} platforms?`,
  (b: string, i: string) => `How to migrate to a new ${i} tool without downtime?`,

  // Trend / market
  (b: string, i: string) => `Future of ${i}: what to expect in 2025`,
  (b: string, i: string) => `Which ${i} companies are leading the market?`,
  (b: string, i: string) => `Emerging trends in the ${i} industry`,
  (b: string, i: string) => `How is AI changing ${i}?`,
  (b: string, i: string) => `Venture-backed ${i} startups to watch`,

  // Customer/persona specific
  (b: string, i: string) => `Best ${i} tools for SaaS companies`,
  (b: string, i: string) => `${i} tools for marketing teams`,
  (b: string, i: string) => `${i} solutions for e-commerce brands`,
  (b: string, i: string) => `${i} platforms for B2B companies`,
  (b: string, i: string) => `${i} tools for content creators`,
  (b: string, i: string) => `${i} software for solo founders`,

  // Support / trust
  (b: string, i: string) => `Which ${i} tools have the best customer support?`,
  (b: string, i: string) => `${i} platforms with strong security and compliance`,
  (b: string, i: string) => `GDPR-compliant ${i} solutions`,
  (b: string, i: string) => `${i} tools with SOC 2 certification`,
  (b: string, i: string) => `Most trusted ${i} vendors in 2025`,
];

// ─── Gemini-powered generation (when API key is available) ───────────────────
async function generateWithGemini(
  brandName: string,
  industry: string,
  count: number
): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a search behavior analyst. Generate exactly ${count} unique, realistic search queries that potential customers type into AI assistants (ChatGPT, Gemini, Perplexity) when researching "${industry}" solutions.

Context:
- Brand being tracked: ${brandName}
- Industry/Category: ${industry}

Requirements:
- Mix of: discovery questions, comparisons, brand-specific queries, use-case questions, market trends
- Sound natural, like something a real buyer would type
- Vary length and phrasing — no two should be too similar
- Include some that mention "${brandName}" directly and some that are generic to "${industry}"
- Return ONLY a JSON array of strings, no explanation

Example format: ["query 1", "query 2", ...]`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;

    return parsed.slice(0, count).map(String);
  } catch {
    return null;
  }
}

// ─── Template fallback ────────────────────────────────────────────────────────
function generateFromTemplates(
  brandName: string,
  industry: string,
  count: number
): string[] {
  // Shuffle templates to get variety each call
  const shuffled = [...QUERY_TEMPLATES].sort(() => Math.random() - 0.5);
  const results: string[] = [];
  const seen = new Set<string>();

  for (const template of shuffled) {
    if (results.length >= count) break;
    const query = template(brandName, industry);
    if (!seen.has(query)) {
      seen.add(query);
      results.push(query);
    }
  }

  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * @param brandName   Human-readable brand name (e.g. "Acme SaaS")
 * @param domain      Brand domain (e.g. "acme-saas.com") — used in some templates
 * @param industry    Industry/category string (e.g. "CRM Software")
 * @param count       Number of prompts to generate — set to plan.maxPromptsPerProject
 */
export async function generatePrompts(
  domain: string,
  brandName: string,
  industry: string,
  count: number = 20
): Promise<string[]> {
  // 1. Mock mode (dev / CI)
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
    return generateFromTemplates(brandName, industry, count);
  }

  // 2. Try Gemini API
  const geminiResult = await generateWithGemini(brandName, industry, count);
  if (geminiResult && geminiResult.length > 0) {
    return geminiResult;
  }

  // 3. High-quality template fallback
  return generateFromTemplates(brandName, industry, count);
}
