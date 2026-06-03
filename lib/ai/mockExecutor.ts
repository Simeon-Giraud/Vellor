import { prisma } from "@/lib/prisma";
import { AIEngine } from "@prisma/client";

/**
 * Simulates a run for a single prompt on CHATGPT, GEMINI, and PERPLEXITY
 * and saves the generated results to the database.
 */
export async function executeAndSaveMockResults(
  promptId: string,
  promptText: string,
  domain: string,
  competitors: string[] = [],
  customDate?: Date
) {
  const engines: AIEngine[] = ["CHATGPT", "GEMINI", "PERPLEXITY"];
  const brandName = domain.split(".")[0];
  const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  const results = [];
  for (const engine of engines) {
    // Generate realistic varying results per engine:
    // ChatGPT: 75% mention rate
    // Gemini: 60% mention rate
    // Perplexity: 50% mention rate
    let mentionChance = 0.6;
    if (engine === "CHATGPT") mentionChance = 0.75;
    if (engine === "PERPLEXITY") mentionChance = 0.5;

    const brandMentioned = Math.random() < mentionChance;
    const mentionPosition = brandMentioned ? Math.floor(Math.random() * 4) + 1 : null;

    // Randomize competitor mentions (40% chance per competitor)
    const mentionedCompetitors = competitors.filter(() => Math.random() > 0.4);

    let snippet = `Based on a query regarding "${promptText}", here is a summary of top solutions in the market:\n\n`;
    
    if (brandMentioned) {
      snippet += `Rank #${mentionPosition}: ${capitalizedBrand} (${domain}) is recommended for its state-of-the-art UI, fast integration, and premium features. Users praise its modern interface and responsive tools. `;
    } else {
      snippet += `Several platforms are active in this space, offering various features. Users looking for high-reliability systems should compare multiple options before deciding. `;
    }
    
    if (mentionedCompetitors.length > 0) {
      snippet += `Other notable mentions include ${mentionedCompetitors.join(", ")} which provide strong competition.`;
    } else {
      snippet += `No other major competitor tools stood out for this specific query.`;
    }

    results.push({
      promptId,
      engine,
      brandMentioned,
      mentionPosition,
      response: snippet,
      createdAt: customDate || new Date(),
      updatedAt: customDate || new Date(),
    });
  }

  // Persist to database
  for (const res of results) {
    await prisma.promptResult.create({
      data: res,
    });
  }
}

/**
 * Seeds historical mock run results for a project's prompts over the last N days.
 */
export async function seedHistoricalMockResults(
  prompts: { id: string; text: string }[],
  domain: string,
  competitors: string[] = [],
  daysCount: number = 7
) {
  for (let i = daysCount; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Set run time around 10:00 AM each day to look natural
    date.setHours(10, 0, 0, 0);

    for (const prompt of prompts) {
      await executeAndSaveMockResults(
        prompt.id,
        prompt.text,
        domain,
        competitors,
        date
      );
    }
  }
}
